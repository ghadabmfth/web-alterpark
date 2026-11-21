"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TextField } from "@/components/ui/forms/TextField";
import { Select } from "@/components/ui/forms/Select";
import { Button } from "@/components/ui/actions/Button";
import { Alert } from "@/components/ui/feedback/Alert";
import { siteContact, telHref } from "@/config/site";
import { CONTACT_SUBJECTS, contactSchema, type ContactData, type ContactInput } from "@/modules/contact/schema";

/*
 * Contact form. Validation runs here and again on the server (Phase 4, with storage, rate
 * limiting and staff notification). Until then a valid submission explains that online sending
 * is not active yet and gives the phone and e-mail: nothing pretends a message was sent.
 */
export function ContactForm({ parkings }: { parkings: { value: string; label: string }[] }) {
  const [validated, setValidated] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", phone: "", subject: undefined, parking: "", message: "", website: "" },
    mode: "onTouched",
  });

  const onSubmit = () => setValidated(true);

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit, () => setValidated(false))} className="flex flex-col gap-6" aria-describedby="contact-required">
      <p id="contact-required" className="m-0 text-text-secondary">Les champs marqués * sont obligatoires.</p>
      <div className="grid gap-6 md:grid-cols-2">
        <TextField label="Nom" autoComplete="name" required error={errors.name?.message} {...register("name")} />
        <TextField label="Adresse e-mail" type="email" autoComplete="email" required error={errors.email?.message} {...register("email")} />
        <TextField label="Téléphone" type="tel" autoComplete="tel" help="Facultatif" error={errors.phone?.message} {...register("phone")} />
        <Select
          label="Sujet"
          required
          placeholder="Choisissez un sujet"
          options={Object.entries(CONTACT_SUBJECTS).map(([value, label]) => ({ value, label }))}
          error={errors.subject?.message}
          {...register("subject")}
        />
        <Select label="Parking concerné" placeholder="Aucun en particulier" options={parkings} help="Facultatif" {...register("parking")} />
      </div>
      <TextField label="Message" multiline rows={6} required error={errors.message?.message} {...register("message")} />
      {/* Honeypot: invisible and unreachable for people, filled by spam bots. */}
      <div className="ap-sr" aria-hidden>
        <label>
          Ne pas remplir
          <input type="text" tabIndex={-1} autoComplete="off" {...register("website")} />
        </label>
      </div>
      {validated ? (
        <Alert tone="info" title="Envoi en ligne bientôt disponible">
          <p>
            Votre message est complet, mais l’envoi depuis le site n’est pas encore activé. Écrivez-nous à{" "}
            <a className="text-primary underline" href={`mailto:${siteContact.email}`}>{siteContact.email}</a> ou appelez le{" "}
            <a className="text-primary underline" href={telHref(siteContact.phone)}>{siteContact.phone}</a>.
          </p>
        </Alert>
      ) : null}
      <div>
        <Button type="submit" loading={isSubmitting} loadingLabel="Vérification…">Envoyer</Button>
      </div>
    </form>
  );
}
