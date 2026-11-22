import { absoluteUrl, siteContact, siteName } from "@/config/site";
import type { OutgoingEmail } from "@/server/email/transport";

/*
 * E-mail templates. Payloads are stored in the outbox; they must not contain secrets other than
 * the single-use link they exist to deliver (the database stores only the token's hash).
 */

export type TemplatePayloads = {
  "auth.verify-email": { firstName: string; url: string };
  "auth.reset-password": { firstName: string; url: string };
  "auth.password-changed": { firstName: string };
  "staff.invite": { firstName: string; invitedBy: string; role: string; url: string };
  "contact.received": { name: string; email: string; subject: string; message: string; parking?: string };
  "reservation.confirmed": { firstName: string; reference: string; parking: string; offer: string; startsAt: string; endsAt: string; total: string };
  "reservation.cancelled": { firstName: string; reference: string; parking: string; startsAt: string; refund?: string };
  "reservation.cancellation-rejected": { firstName: string; reference: string; note: string };
  "reservation.cancellation-requested": { reference: string; customer: string; parking: string; startsAt: string; reason: string };
};

export type TemplateName = keyof TemplatePayloads;

const escapeHtml = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

function layout(title: string, paragraphs: string[], action?: { label: string; url: string }): { text: string; html: string } {
  const footer = `${siteName} — ${siteContact.phone} — ${siteContact.email}`;
  const text = [title, "", ...paragraphs, ...(action ? ["", `${action.label} : ${action.url}`] : []), "", footer].join("\n");
  const html = `<!doctype html><html lang="fr"><body style="font-family:Montserrat,Arial,sans-serif;line-height:1.5">
<h1 style="font-size:20px">${escapeHtml(title)}</h1>
${paragraphs.map((p) => `<p>${escapeHtml(p)}</p>`).join("\n")}
${action ? `<p><a href="${escapeHtml(action.url)}">${escapeHtml(action.label)}</a></p>` : ""}
<p style="font-size:13px">${escapeHtml(footer)}</p></body></html>`;
  return { text, html };
}

export function renderEmail<T extends TemplateName>(template: T, to: string, payload: TemplatePayloads[T]): OutgoingEmail {
  switch (template) {
    case "auth.verify-email": {
      const p = payload as TemplatePayloads["auth.verify-email"];
      return { to, subject: "Confirmez votre adresse e-mail", ...layout(`Bonjour ${p.firstName},`, ["Merci d’avoir créé votre compte ALTERPARK. Confirmez votre adresse e-mail pour sécuriser votre compte.", "Ce lien est valable 48 heures."], { label: "Confirmer mon adresse", url: p.url }) };
    }
    case "auth.reset-password": {
      const p = payload as TemplatePayloads["auth.reset-password"];
      return { to, subject: "Réinitialisation de votre mot de passe", ...layout(`Bonjour ${p.firstName},`, ["Vous avez demandé à réinitialiser votre mot de passe. Ce lien est valable 1 heure et ne peut servir qu’une fois.", "Si vous n’êtes pas à l’origine de cette demande, ignorez cet e-mail : votre mot de passe reste inchangé."], { label: "Choisir un nouveau mot de passe", url: p.url }) };
    }
    case "auth.password-changed": {
      const p = payload as TemplatePayloads["auth.password-changed"];
      return { to, subject: "Votre mot de passe a été modifié", ...layout(`Bonjour ${p.firstName},`, ["Le mot de passe de votre compte ALTERPARK vient d’être modifié. Toutes vos sessions ont été déconnectées.", `Si vous n’êtes pas à l’origine de ce changement, contactez-nous immédiatement : ${siteContact.phone}.`], { label: "Se connecter", url: absoluteUrl("/connexion") }) };
    }
    case "staff.invite": {
      const p = payload as TemplatePayloads["staff.invite"];
      return { to, subject: "Votre accès au back-office ALTERPARK", ...layout(`Bonjour ${p.firstName},`, [`${p.invitedBy} vous a créé un accès au back-office ALTERPARK (rôle : ${p.role}).`, "Choisissez votre mot de passe pour activer votre compte. Ce lien est valable 72 heures et ne peut servir qu’une fois."], { label: "Choisir mon mot de passe", url: p.url }) };
    }
    case "contact.received": {
      const p = payload as TemplatePayloads["contact.received"];
      return { to, subject: `Nouvelle demande de contact : ${p.subject}`, ...layout("Nouvelle demande de contact", [`De : ${p.name} <${p.email}>`, ...(p.parking ? [`Parking : ${p.parking}`] : []), `Sujet : ${p.subject}`, p.message], { label: "Ouvrir le back-office", url: absoluteUrl("/admin/contacts") }) };
    }
    case "reservation.confirmed": {
      const p = payload as TemplatePayloads["reservation.confirmed"];
      return { to, subject: `Réservation confirmée — ${p.reference}`, ...layout(`Bonjour ${p.firstName},`, [`Votre réservation ${p.reference} est confirmée.`, `Parking : ${p.parking} — ${p.offer}`, `Dépôt du véhicule : ${p.startsAt}`, `Récupération : ${p.endsAt}`, `Montant payé : ${p.total}`], { label: "Voir ma réservation", url: absoluteUrl(`/compte/reservations/${p.reference}`) }) };
    }
    case "reservation.cancelled": {
      const p = payload as TemplatePayloads["reservation.cancelled"];
      return { to, subject: `Réservation annulée — ${p.reference}`, ...layout(`Bonjour ${p.firstName},`, [`Votre réservation ${p.reference} (${p.parking}, ${p.startsAt}) est annulée.`, ...(p.refund ? [`Un remboursement de ${p.refund} est en cours : il apparaîtra sur votre relevé sous 5 à 10 jours.`] : [])], { label: "Mes réservations", url: absoluteUrl("/compte/reservations") }) };
    }
    case "reservation.cancellation-rejected": {
      const p = payload as TemplatePayloads["reservation.cancellation-rejected"];
      return { to, subject: `Demande d’annulation — ${p.reference}`, ...layout(`Bonjour ${p.firstName},`, [`Votre demande d’annulation de la réservation ${p.reference} n’a pas pu être acceptée.`, p.note, `Pour toute question : ${siteContact.phone}.`], { label: "Voir ma réservation", url: absoluteUrl(`/compte/reservations/${p.reference}`) }) };
    }
    case "reservation.cancellation-requested": {
      const p = payload as TemplatePayloads["reservation.cancellation-requested"];
      return { to, subject: `Demande d’annulation — ${p.reference}`, ...layout("Nouvelle demande d’annulation", [`Réservation : ${p.reference}`, `Client : ${p.customer}`, `Parking : ${p.parking} — arrivée ${p.startsAt}`, `Motif : ${p.reason}`], { label: "Ouvrir le back-office", url: absoluteUrl("/admin/reservations") }) };
    }
  }
  throw new Error(`Unknown e-mail template: ${String(template)}`);
}
