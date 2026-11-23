import "server-only";
import { env } from "@/server/config/env";

/*
 * E-mail transport behind one interface (ADR-013). `console` prints e-mails to the server log
 * (development, Preview without a provider); `resend` calls the Resend HTTP API (no SDK).
 */

export interface OutgoingEmail {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export interface EmailTransport {
  send(email: OutgoingEmail): Promise<void>;
}

const consoleTransport: EmailTransport = {
  async send(email) {
    console.info(`[email:console] to=${email.to} subject="${email.subject}"\n${email.text}`);
  },
};

function resendTransport(apiKey: string, from: string): EmailTransport {
  return {
    async send(email) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [email.to], subject: email.subject, text: email.text, html: email.html }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}: ${(await res.text()).slice(0, 300)}`);
    },
  };
}

export function emailTransport(): EmailTransport {
  const cfg = env("email");
  return cfg.EMAIL_TRANSPORT === "resend" ? resendTransport(cfg.RESEND_API_KEY!, cfg.EMAIL_FROM) : consoleTransport;
}
