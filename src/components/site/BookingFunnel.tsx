"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

/*
 * Booking funnel (Phase 3: interface and client-side validation).
 * Server-side availability, pricing and the hold are Phase 5; online payment is Phase 6. The
 * summary step says so explicitly: no price is invented and no confirmation is faked.
 */

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

export function BookingFunnel({ parkings }: { parkings: FunnelParking[] }) {
  const [step, setStep] = useState(0);
  /** Stay validated when leaving step 1; the summary shows exactly what was checked. */
  const [validStay, setValidStay] = useState<ValidStay | null>(null);
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

  const next = async () => {
    const fieldsOk = await trigger(STEP_FIELDS[step]);
    // Step 1 reports every problem at once: missing choices and stay rules together.
    const stayOk = step === 0 ? checkStay() : true;
    if (fieldsOk && stayOk) setStep((s) => Math.min(STEPS.length - 1, s + 1));
    else focusFirstInvalid();
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
                <Button size="sm" onClick={next}>
                  Continuer
                </Button>
              ) : (
                <Button size="sm" disabled aria-describedby="payment-unavailable">
                  Payer et confirmer
                </Button>
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
            <p className="m-0 text-text-secondary">Un compte client est créé avec ces informations : il vous permet de retrouver et d’annuler vos réservations.</p>
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
                  { term: "Prix", value: "Calculé lors de la vérification des disponibilités" },
                ]}
              />
            ) : null}
            <div id="payment-unavailable">
              <Alert tone="info" title="Réservation en ligne bientôt disponible">
                <p>La vérification des places, le calcul du prix et le paiement sécurisé seront activés dans les prochaines étapes du projet. Aucune réservation n’est enregistrée pour le moment.</p>
              </Alert>
            </div>
          </div>
        </Card>
      </form>
    </div>
  );
}
