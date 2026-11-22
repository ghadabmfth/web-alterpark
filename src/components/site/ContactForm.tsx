"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/ui/forms/TextField";
import { Select } from "@/components/ui/forms/Select";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { CONTACT_SUBJECTS, contactSchema, type ContactInput } from "@/modules/contact/schema";
import { contactAction } from "@/modules/contact/actions";
import { useActionForm } from "./useActionForm";

/* Contact form, posted to the contactAction Server Action (validated again on the server). */
export function ContactForm({ parkings }: { parkings: { value: string; label: string }[] }) {
  const { form, state, pending, formAction, onSubmit } = useActionForm<ContactInput>(
    contactAction,
    zodResolver(contactSchema),
    {
      name: "",
      email: "",
      phone: "",
      subject: undefined,
      parking: "",
      message: "",
      website: "",
    },
    // Page load time, for the minimum-fill-time spam check (added at submit, no hydration mismatch).
    () => ({ startedAt: String(Math.round(performance.timeOrigin)) }),
  );
  const errors = form.formState.errors;

  if (state.status === "success") {
    return <Alert tone="success" title="Message envoyé">{state.message}</Alert>;
  }

  return (
    <form noValidate action={formAction} onSubmit={onSubmit} className="flex flex-col gap-6" aria-label="Formulaire de contact" aria-describedby="contact-required">
      <p id="contact-required" className="m-0 text-text-secondary">Les champs marqués * sont obligatoires.</p>
      {state.message ? <Alert tone="error">{state.message}</Alert> : null}
      <div className="grid gap-6 md:grid-cols-2">
        <TextField label="Nom" autoComplete="name" required error={errors.name?.message} {...form.register("name")} />
        <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={errors.email?.message} {...form.register("email")} />
        <TextField label="Téléphone" type="tel" autoComplete="tel" help="Facultatif" error={errors.phone?.message} {...form.register("phone")} />
        <Select
          label="Sujet"
          required
          placeholder="Choisissez un sujet"
          options={Object.entries(CONTACT_SUBJECTS).map(([value, label]) => ({ value, label }))}
          error={errors.subject?.message}
          {...form.register("subject")}
        />
        <Select label="Parking concerné" placeholder="Aucun en particulier" options={parkings} help="Facultatif" {...form.register("parking")} />
      </div>
      <TextField label="Message" multiline rows={6} required error={errors.message?.message} {...form.register("message")} />
      {/* Honeypot: invisible and unreachable for people, filled by spam bots. */}
      <div className="ap-sr" aria-hidden>
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" {...form.register("website")} />
        </label>
      </div>
      <div>
        <Button type="submit" loading={pending} loadingLabel="Envoi…">Envoyer</Button>
      </div>
    </form>
  );
}
