"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Stepper } from "@/components/ui/navigation/Stepper";
import { Select } from "@/components/ui/forms/Select";
import { RadioGroup } from "@/components/ui/forms/RadioGroup";
import { DateTimeField } from "@/components/ui/forms/DateTimeField";
import { TextField } from "@/components/ui/forms/TextField";
import { Checkbox } from "@/components/ui/forms/Checkbox";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { Card } from "@/components/ui/layout/Card";
import { DescriptionList } from "@/components/ui/data/DescriptionList";
import { StatusIcon } from "@/components/ui/icons/icons";
import { routes } from "@/config/site";
import { bookingFormSchema, MAX_PASSENGERS, type BookingFormData, type BookingFormInput } from "@/modules/reservations/schemas";
import { formatDateTime, formatDuration, validateStay, type StayField, type ValidStay } from "@/modules/reservations/domain/stay";
import { quoteAction, type QuoteState } from "@/modules/reservations/actions";
import { bookPayOnSiteAction, funnelSessionAction, startCheckoutAction, type FunnelSession } from "@/modules/payments/actions";

/*
 * Booking funnel. Step 1 is checked twice: instantly in the browser (shared rules), then by the
 * server (quoteAction), which re-validates the stay and returns the real availability and the
 * price computed from the database. « Payer » re-validates everything on the server, holds the
 * space and redirects to the hosted payment page; the reservation is confirmed only by the
 * payment webhook. The customer must be signed in (ADR-011): the funnel is saved in this tab
 * (sessionStorage) while they sign in or create their account, then restored.
 */

const SAVED_KEY = "alterpark:funnel";
const newKey = () => crypto.randomUUID().replace(/-/g, "");

export interface FunnelParking {
  slug: string;
  name: string;
  timeZone: string;
  minLeadMinutes: number;
  maxStayDays: number;
  horizonDays: number;
  offers: { code: string; label: string }[];
}

const STEPS = ["Parking et dates", "Véhicule", "Coordonnées", "Récapitulatif"];

const STEP_FIELDS: FieldPath<BookingFormInput>[][] = [
  ["parking", "offer", "departureDate", "departureTime", "returnDate", "returnTime"],
  ["plate", "passengers", "outboundFlight", "returnFlight"],
  ["firstName", "lastName", "email", "phone", "acceptTerms"],
];

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="ap-field__msg ap-field__msg--error" id={id}>
      <StatusIcon tone="error" />
      <span>{message}</span>
    </p>
  );
}

export function BookingFunnel({ parkings, paymentsEnabled }: { parkings: FunnelParking[]; paymentsEnabled: boolean }) {
  const [step, setStep] = useState(0);
  /** Stay validated when leaving step 1; the summary shows exactly what was checked. */
  const [validStay, setValidStay] = useState<ValidStay | null>(null);
  /** Server quote for the stay validated at step 1. */
  const [quote, setQuote] = useState<Extract<QuoteState, { status: "ok" }> | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [quoting, setQuoting] = useState(false);
  const unavailableRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const [session, setSession] = useState<FunnelSession | null>(null);
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState<string | null>(null);
  /** One key per quoted stay: a double click or a retry returns the same reservation. */
  const payKey = useRef<string>("");
  /** Customer's choice: pay online now (Stripe) or at the counter on return. */
  const [payMode, setPayMode] = useState<"ONLINE" | "ON_SITE">(paymentsEnabled ? "ONLINE" : "ON_SITE");
  const heading = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const defaultParking = parkings.length === 1 ? parkings[0]!.slug : "";
  const form = useForm<BookingFormInput, unknown, BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    mode: "onTouched",
    defaultValues: {
      parking: defaultParking,
      offer: "",
      departureDate: "",
      departureTime: "",
      returnDate: "",
      returnTime: "",
      plate: "",
      passengers: "1",
      outboundFlight: "",
      returnFlight: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      acceptTerms: false as unknown as true,
    },
  });
  const { register, control, setValue, setError, trigger, getValues, formState } = form;
  const errors = formState.errors;
  const v = useWatch({ control }) as BookingFormInput;
  const parking = useMemo(() => parkings.find((p) => p.slug === v.parking), [parkings, v.parking]);

  // A field in error is revalidated on every change: the message disappears as soon as the value
  // is fixed, instead of on blur (which shifted the layout under the pointer and swallowed clicks).
  useEffect(() => {
    return form.subscribe({
      formState: { values: true },
      callback: ({ name }) => {
        const field = name as FieldPath<BookingFormInput> | undefined;
        if (field && form.getFieldState(field).invalid) void form.trigger(field);
      },
    });
  }, [form]);

  // Prefill from the parking page's search (?parking=&offre=&depart=…), read after mount so the
  // whole form is server-rendered (no Suspense fallback, no layout shift).
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    if (q.get("reprise")) {
      // Back from sign-in: restore what the customer had typed (this tab only).
      try {
        const saved = sessionStorage.getItem(SAVED_KEY);
        if (saved) form.reset({ ...form.getValues(), ...(JSON.parse(saved) as Partial<BookingFormInput>) });
      } catch {
        /* storage unavailable: the customer fills the form again */
      }
      return;
    }
    const p = parkings.find((x) => x.slug === q.get("parking"));
    if (!p && !q.get("depart")) return;
    const pick = (k: string) => q.get(k) ?? "";
    form.reset({
      ...form.getValues(),
      parking: p?.slug ?? form.getValues("parking"),
      offer: p?.offers.find((o) => o.code === q.get("offre"))?.code ?? "",
      departureDate: pick("depart"),
      departureTime: pick("heureDepart"),
      returnDate: pick("retour"),
      returnTime: pick("heureRetour"),
    });
  }, [form, parkings]);

  // Signed-in customers book on their account; their details prefill the empty fields.
  useEffect(() => {
    let live = true;
    funnelSessionAction()
      .then((s) => {
        if (!live) return;
        setSession(s);
        if (!s.signedIn) return;
        for (const k of ["firstName", "lastName", "email", "phone"] as const) {
          if (!form.getValues(k)) form.setValue(k, s[k]);
        }
      })
      .catch(() => live && setSession({ signedIn: false }));
    return () => {
      live = false;
    };
  }, [form]);

  // A refusal from the server (full, no rate…) is not tied to a field: move focus to the message.
  useEffect(() => {
    if (unavailable) unavailableRef.current?.focus();
  }, [unavailable]);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    heading.current?.focus();
  }, [step]);

  /** Validates the stay with the parking's rules (time zone, lead time, max stay, horizon). */
  const checkStay = (): boolean => {
    if (!parking) return false; // the "Choisissez un parking" error is already shown
    const v = getValues();
    const { errors: stayErrors, stay } = validateStay(
      { date: v.departureDate, time: v.departureTime },
      { date: v.returnDate, time: v.returnTime },
      { now: Date.now(), timeZone: parking.timeZone, minLeadMinutes: parking.minLeadMinutes, maxStayDays: parking.maxStayDays, horizonDays: parking.horizonDays },
    );
    (Object.entries(stayErrors) as [StayField, string][]).forEach(([field, message]) => setError(field, { type: "stay", message }));
    setValidStay(stay);
    return stay !== null;
  };

  /** First invalid control in document order: a field, or the first radio of an invalid group. */
  const focusFirstInvalid = () =>
    requestAnimationFrame(() => document.querySelector<HTMLElement>("[aria-invalid='true'], [data-invalid='true'] input")?.focus());

  /** Real availability and price from the server; false keeps the customer on step 1. */
  const checkQuote = async (): Promise<boolean> => {
    const { parking, offer, departureDate, departureTime, returnDate, returnTime } = getValues();
    setQuoting(true);
    try {
      const r = await quoteAction({ parking, offer, departureDate, departureTime, returnDate, returnTime });
      if (r.status === "ok") {
        setQuote(r);
        payKey.current = newKey();
        return true;
      }
      setQuote(null);
      if (r.status === "invalid") (Object.entries(r.errors) as [StayField, string][]).forEach(([field, message]) => setError(field, { type: "stay", message }));
      else setUnavailable(r.message);
      return false;
    } catch {
      setUnavailable("La vérification des disponibilités a échoué. Vérifiez votre connexion et réessayez.");
      return false;
    } finally {
      setQuoting(false);
    }
  };

  const next = async () => {
    setUnavailable(null);
    const fieldsOk = await trigger(STEP_FIELDS[step]);
    // Step 1 reports every problem at once: missing choices and stay rules together.
    const stayOk = step === 0 ? checkStay() : true;
    if (!fieldsOk || !stayOk) return focusFirstInvalid();
    if (step === 0 && !(await checkQuote())) {
      if (Object.keys(form.formState.errors).length) focusFirstInvalid();
      return;
    }
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  };

  const goToSignIn = (path: "/connexion" | "/inscription") => {
    try {
      const values: Partial<BookingFormInput> = { ...getValues() };
      delete values.acceptTerms; // consent is given again, never restored
      sessionStorage.setItem(SAVED_KEY, JSON.stringify(values));
    } catch {
      /* storage unavailable */
    }
    router.push(`${path}?suivant=${encodeURIComponent(`${routes.booking}?reprise=1`)}`);
  };

  const pay = async () => {
    setPayError(null);
    if (!(await trigger())) {
      setPayError("Certaines informations sont à corriger : revenez aux étapes précédentes.");
      return;
    }
    setPaying(true);
    try {
      const key = payKey.current || (payKey.current = newKey());
      const r = payMode === "ONLINE" ? await startCheckoutAction(getValues(), key) : await bookPayOnSiteAction(getValues(), key);
      if (r.status === "redirect") {
        try {
          sessionStorage.removeItem(SAVED_KEY);
        } catch {}
        // Hosted payment page (online) or the confirmed booking (on site); the button stays busy.
        if (r.url.startsWith("/")) router.push(r.url);
        else window.location.assign(r.url);
        return;
      }
      setPaying(false);
      if (r.status === "auth") return setSession({ signedIn: false });
      if (r.status === "stay" || r.status === "invalid") {
        const errors = r.status === "stay" ? r.errors : r.fieldErrors;
        (Object.entries(errors) as [FieldPath<BookingFormInput>, string][]).forEach(([field, message]) => setError(field, { type: "server", message }));
        const target = STEP_FIELDS.findIndex((fields) => fields.some((f) => f in errors));
        setStep(target === -1 ? 0 : target);
        return;
      }
      setPayError(r.message);
    } catch {
      setPaying(false);
      setPayError("La connexion a été interrompue. Vérifiez votre connexion et réessayez : aucune somme n’a été débitée.");
    }
  };

  const offerLabel = parking?.offers.find((o) => o.code === v.offer)?.label ?? "";

  return (
    <div className="flex flex-col gap-8">
      <Stepper steps={STEPS} current={step} label="Étapes de la réservation" />
      <form noValidate onSubmit={(e) => e.preventDefault()} aria-labelledby="funnel-step">
        <Card
          title={
            <span id="funnel-step" ref={heading} tabIndex={-1} className="outline-none">
              {STEPS[step]}
            </span>
          }
          footer={
            <>
              {step > 0 ? (
                <Button variant="secondary" size="sm" onClick={() => setStep((s) => s - 1)}>
                  Retour
                </Button>
              ) : null}
              {step < STEPS.length - 1 ? (
                <Button size="sm" onClick={next} loading={quoting} loadingLabel="Vérification…">
                  Continuer
                </Button>
              ) : (
                session?.signedIn ? (
                  <Button size="sm" onClick={pay} loading={paying} loadingLabel={payMode === "ONLINE" ? "Redirection vers le paiement…" : "Confirmation…"}>
                    {payMode === "ONLINE" ? (quote ? `Payer ${quote.total}` : "Payer et confirmer") : "Confirmer ma réservation"}
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => goToSignIn("/connexion")} disabled={!session}>
                    Se connecter pour réserver
                  </Button>
                )
              )}
            </>
          }
        >
          {/* Steps stay mounted (hidden) so values and field registration persist. */}
          <div hidden={step !== 0} className="flex flex-col gap-8">
            <Select
              label="Parking"
              required
              placeholder="Choisissez un parking"
              options={parkings.map((p) => ({ value: p.slug, label: p.name }))}
              error={errors.parking?.message}
              {...register("parking", { onChange: () => setValue("offer", "") })}
            />
            {parking ? (
              <div className="flex flex-col gap-2" data-invalid={errors.offer ? "true" : undefined}>
                <RadioGroup
                  legend="Formule"
                  name="offer"
                  options={parking.offers.map((o) => ({ value: o.code, label: o.label }))}
                  value={v.offer}
                  onChange={(e) => setValue("offer", e.target.value, { shouldValidate: true })}
                />
                <FieldError id="offer-error" message={errors.offer?.message} />
              </div>
            ) : null}
            <div className="grid gap-8 md:grid-cols-2">
              <DateTimeField
                legend="Départ : dépôt du véhicule"
                required
                help={parking ? `Heure locale du parking. Au moins ${formatDuration(parking.minLeadMinutes).replace(/ /g, "\u00a0")} à l’avance.` : "Heure locale du parking."}
                error={errors.departureDate?.message ?? errors.departureTime?.message}
                dateProps={register("departureDate")}
                timeProps={register("departureTime")}
              />
              <DateTimeField
                legend="Retour : récupération du véhicule"
                required
                help="Toute période de 24 h commencée est due."
                error={errors.returnDate?.message ?? errors.returnTime?.message}
                dateProps={register("returnDate")}
                timeProps={register("returnTime")}
              />
            </div>
            {unavailable ? (
              <div ref={unavailableRef} tabIndex={-1} className="outline-none">
                <Alert tone="warning" title="Réservation impossible">
                  <p>{unavailable}</p>
                </Alert>
              </div>
            ) : null}
          </div>

          <div hidden={step !== 1} className="grid gap-8 md:grid-cols-2">
            <TextField label="Immatriculation" required autoComplete="off" placeholder="AB-123-CD" error={errors.plate?.message} {...register("plate")} />
            <TextField label="Nombre de passagers" type="number" min={1} max={MAX_PASSENGERS} required error={errors.passengers?.message} {...register("passengers")} />
            <TextField label="Vol aller" help="Facultatif. Exemple : AF1234" error={errors.outboundFlight?.message} {...register("outboundFlight")} />
            <TextField label="Vol retour" help="Facultatif, utile en cas de retard." error={errors.returnFlight?.message} {...register("returnFlight")} />
          </div>

          <div hidden={step !== 2} className="flex flex-col gap-8">
            <div className="grid gap-8 md:grid-cols-2">
              <TextField label="Prénom" required autoComplete="given-name" error={errors.firstName?.message} {...register("firstName")} />
              <TextField label="Nom" required autoComplete="family-name" error={errors.lastName?.message} {...register("lastName")} />
              <TextField label="Adresse e-mail" type="email" required autoComplete="email" help="Votre confirmation sera envoyée à cette adresse." error={errors.email?.message} {...register("email")} />
              <TextField label="Téléphone" type="tel" required autoComplete="tel" error={errors.phone?.message} {...register("phone")} />
            </div>
            <p className="m-0 text-text-secondary">
              {session?.signedIn
                ? `La réservation sera enregistrée sur votre compte (${session.email}). Les coordonnées ci-dessus sont celles du conducteur.`
                : "Un compte client est nécessaire pour payer : il vous permet de retrouver, modifier et annuler vos réservations. Vous pourrez vous connecter ou le créer au moment du paiement, sans perdre votre saisie."}
            </p>
            <div className="flex flex-col gap-2">
              <Checkbox
                label={
                  <>
                    J’accepte les <a className="text-primary underline" href={routes.terms} target="_blank" rel="noopener">conditions générales de vente</a>
                  </>
                }
                invalid={!!errors.acceptTerms}
                aria-describedby={errors.acceptTerms ? "terms-error" : undefined}
                {...register("acceptTerms")}
              />
              <FieldError id="terms-error" message={errors.acceptTerms?.message} />
            </div>
          </div>

          <div hidden={step !== 3} className="flex flex-col gap-8">
            {parking && validStay ? (
              <DescriptionList
                items={[
                  { term: "Parking", value: parking.name },
                  { term: "Formule", value: offerLabel },
                  { term: "Départ", value: formatDateTime(validStay.startUtc, parking.timeZone) },
                  { term: "Retour", value: formatDateTime(validStay.endUtc, parking.timeZone) },
                  { term: "Durée facturée", value: `${validStay.days} ${validStay.days > 1 ? "jours" : "jour"}` },
                  { term: "Véhicule", value: v.plate.trim().toUpperCase() },
                  { term: "Passagers", value: String(v.passengers) },
                  { term: "Client", value: `${v.firstName} ${v.lastName} — ${v.email}` },
                  { term: "Prix TTC", value: quote ? quote.total : "—" },
                ]}
              />
            ) : null}
            <RadioGroup
              legend="Paiement"
              name="payMode"
              options={[
                ...(paymentsEnabled ? [{ value: "ONLINE", label: "Payer maintenant en ligne (carte bancaire, paiement sécurisé)" }] : []),
                { value: "ON_SITE", label: "Payer sur place à mon retour (carte bancaire, espèces, chèques vacances)" },
              ]}
              value={payMode}
              onChange={(e) => {
                setPayMode(e.target.value as "ONLINE" | "ON_SITE");
                payKey.current = newKey(); // a new request for the other mode
              }}
            />
            {payError ? (
              <Alert tone="error" title="Réservation non enregistrée">
                <p>{payError}</p>
              </Alert>
            ) : null}
            {session && !session.signedIn ? (
              <Alert tone="info" title="Connectez-vous pour réserver">
                <p>
                  Votre saisie est conservée.{" "}
                  <button type="button" className="text-primary underline" onClick={() => goToSignIn("/inscription")}>Créer un compte</button>{" "}
                  si vous n’en avez pas encore.
                </p>
              </Alert>
            ) : (
              <p className="m-0 text-text-secondary">
                {payMode === "ONLINE"
                  ? "Vous allez être redirigé vers la page de paiement sécurisée de notre prestataire Stripe. Votre place est bloquée pendant 30 minutes ; la réservation est confirmée dès la validation du paiement."
                  : `Votre réservation est confirmée immédiatement. Vous réglez ${quote ? quote.total : "le montant"} à l’accueil à votre retour : carte bancaire, espèces ou chèques vacances.`}
              </p>
            )}
          </div>
        </Card>
      </form>
    </div>
  );
}
