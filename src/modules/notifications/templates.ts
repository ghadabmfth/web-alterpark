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
  "contact.received": { name: string; email: string; subject: string; message: string; parking?: string };
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
    case "contact.received": {
      const p = payload as TemplatePayloads["contact.received"];
      return { to, subject: `Nouvelle demande de contact : ${p.subject}`, ...layout("Nouvelle demande de contact", [`De : ${p.name} <${p.email}>`, ...(p.parking ? [`Parking : ${p.parking}`] : []), `Sujet : ${p.subject}`, p.message], { label: "Ouvrir le back-office", url: absoluteUrl("/admin/contacts") }) };
    }
  }
  throw new Error(`Unknown e-mail template: ${String(template)}`);
}
