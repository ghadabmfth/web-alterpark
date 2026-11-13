"use client";

/* Proposé : coordonnées du client, construit sur TextField, Select, Checkbox, Alert et Button. */
import { useId, useRef, useState, type FormEvent } from "react";
import { cx } from "../../lib/cx";
import { TextField } from "../../forms/TextField/TextField";
import { Select } from "../../forms/Select/Select";
import { Checkbox } from "../../forms/Checkbox/Checkbox";
import { Alert } from "../../feedback/Alert/Alert";
import { Button } from "../../actions/Button/Button";
import { ErrorIcon } from "../../icons/ui";
import {
  EMPTY_CUSTOMER,
  MAX_PASSENGERS_DEFAULT,
  validateCustomer,
  type CustomerDetails,
  type CustomerErrors,
  type CustomerField,
  type CustomerInput,
} from "@/lib/booking/customer";

export interface CustomerFormProps {
  defaultValues?: Partial<CustomerInput>;
  /** Places passagers de la navette (réglage du parking). */
  maxPassengers?: number;
  /** Lien vers les conditions générales de vente (ouvert dans un nouvel onglet). */
  cgvHref: string;
  onSubmit?: (data: CustomerDetails) => void;
  /** Envoi en cours (blocage de la place). */
  pending?: boolean;
  submitLabel?: string;
  className?: string;
}

const ORDER: CustomerField[] = ["firstName", "lastName", "email", "phone", "plate", "passengers", "flight", "cgv"];

/**
 * Nom, e-mail, téléphone, immatriculation, passagers, vol (facultatif) et acceptation des CGV.
 * Chaque champ est vérifié quand on le quitte ; à l'envoi, un message résume les erreurs et le
 * focus va au premier champ à corriger.
 */
export function CustomerForm({ defaultValues, maxPassengers = MAX_PASSENGERS_DEFAULT, cgvHref, onSubmit, pending, submitLabel, className }: CustomerFormProps) {
  const [values, setValues] = useState<CustomerInput>({ ...EMPTY_CUSTOMER, ...defaultValues });
  const [errors, setErrors] = useState<CustomerErrors>({});
  const [summary, setSummary] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const cgvMsgId = useId();
  const ids = useId();
  const idOf = (f: CustomerField) => `${ids}-${f}`;

  const fieldError = (f: CustomerField, v: CustomerInput) => {
    const r = validateCustomer(v, maxPassengers);
    return r.ok ? undefined : r.errors[f];
  };
  const set = <K extends keyof CustomerInput>(f: K, val: CustomerInput[K]) => {
    const next = { ...values, [f]: val };
    setValues(next);
    // Une erreur déjà affichée se met à jour pendant la correction.
    if (errors[f]) setErrors((e) => ({ ...e, [f]: fieldError(f, next) }));
  };
  const blur = (f: CustomerField) => setErrors((e) => ({ ...e, [f]: fieldError(f, values) }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const r = validateCustomer(values, maxPassengers);
    if (r.ok) {
      setErrors({});
      setSummary(0);
      onSubmit?.(r.data);
      return;
    }
    setErrors(r.errors);
    setSummary(Object.keys(r.errors).length);
    const first = ORDER.find((f) => r.errors[f]);
    if (first) requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>(`#${CSS.escape(idOf(first))}`)?.focus());
  };

  const text = (f: Exclude<CustomerField, "passengers" | "cgv">) => ({
    id: idOf(f),
    name: f,
    value: values[f],
    error: errors[f],
    onChange: (e: { target: { value: string } }) => set(f, e.target.value),
    onBlur: () => blur(f),
  });

  return (
    <form ref={formRef} className={cx("ap-root ap-customer", className)} onSubmit={submit} noValidate aria-label="Vos coordonnées">
      {summary ? (
        <Alert tone="error" title="Vérifiez vos informations">
          {summary > 1 ? `${summary} champs sont à corriger.` : "Un champ est à corriger."}
        </Alert>
      ) : null}
      <p className="ap-customer__required">
        Les champs marqués d’un <span aria-hidden>*</span>
        <span className="ap-sr">astérisque</span> sont obligatoires.
      </p>
      <div className="ap-customer__grid">
        <TextField label="Prénom" required autoComplete="given-name" {...text("firstName")} />
        <TextField label="Nom" required autoComplete="family-name" {...text("lastName")} />
        <TextField label="E-mail" type="email" required autoComplete="email" inputMode="email" help="Votre confirmation de réservation y sera envoyée." {...text("email")} />
        <TextField label="Téléphone" type="tel" required autoComplete="tel" inputMode="tel" {...text("phone")} />
        <TextField label="Immatriculation" required autoCapitalize="characters" spellCheck={false} help="Exemple : AB-123-CD" {...text("plate")} />
        <Select
          label="Passagers"
          id={idOf("passengers")}
          name="passengers"
          required
          help="Vous compris."
          options={Array.from({ length: maxPassengers }, (_, i) => String(i + 1))}
          value={values.passengers}
          error={errors.passengers}
          onChange={(e) => set("passengers", e.target.value)}
          onBlur={() => blur("passengers")}
        />
        <TextField label="Numéro de vol (facultatif)" autoCapitalize="characters" spellCheck={false} help="Exemple : AF1234" {...text("flight")} />
      </div>
      <div className="ap-customer__cgv">
        <Checkbox
          id={idOf("cgv")}
          name="cgv"
          required
          checked={values.cgv}
          invalid={!!errors.cgv}
          aria-describedby={errors.cgv ? cgvMsgId : undefined}
          onChange={(e) => set("cgv", e.target.checked)}
          onBlur={() => (errors.cgv ? blur("cgv") : undefined)}
          label={
            <>
              J’accepte les{" "}
              <a className="ap-customer__link" href={cgvHref} target="_blank" rel="noopener">
                conditions générales de vente
                <span className="ap-sr"> (nouvel onglet)</span>
              </a>
              .
            </>
          }
        />
        {errors.cgv ? (
          <p className="ap-field__msg ap-field__msg--error" id={cgvMsgId}>
            <ErrorIcon />
            <span>{errors.cgv}</span>
          </p>
        ) : null}
      </div>
      <Button type="submit" disabled={pending} className="ap-customer__submit">
        {pending ? "Vérification de la disponibilité…" : submitLabel || "Continuer vers le récapitulatif"}
      </Button>
    </form>
  );
}
