import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { ReactElement } from "react";
import { accentTitle } from "../lib/accent-title";
import { plainText } from "../lib/text";
import { Button } from "../actions/Button";
import { IconButton } from "../actions/IconButton";
import { Breadcrumbs } from "../navigation/Breadcrumbs";
import { Steps } from "../content/Steps";
import { Stars } from "../content/Stars";
import { SectionHeading } from "../content/SectionHeading";
import { TextField } from "../forms/TextField";
import { Select } from "../forms/Select";
import { DateTimeField } from "../forms/DateTimeField";
import { Alert } from "../feedback/Alert";
import { Badge } from "../feedback/Badge";
import { EmptyState } from "../feedback/EmptyState";
import { DataTable } from "../data/DataTable";
import { Pagination } from "../data/Pagination";
import { StatTile } from "../data/StatTile";
import { Footer } from "../navigation/Footer";
import { siteContact } from "@/config/site";

const html = (el: ReactElement) => renderToStaticMarkup(el);

describe("accentTitle", () => {
  it("accents digits, punctuation and [bracketed] words", () => {
    expect(html(<h2>{accentTitle("Depuis le 20 mars !")}</h2>)).toBe('<h2>Depuis le <span class="ap-accent">20</span> mars <span class="ap-accent">!</span></h2>');
    expect(html(<h2>{accentTitle("Votre parking [couvert]")}</h2>)).toBe('<h2>Votre parking <span class="ap-accent">couvert</span></h2>');
    expect(plainText(accentTitle("Le 20 mars !"))).toBe("Le 20 mars !");
  });
});

describe("Button", () => {
  it("renders a button by default, an internal link, an external link", () => {
    expect(html(<Button>OK</Button>)).toMatch(/^<button type="button" class="ap-btn ap-btn--primary ap-btn--md">/);
    expect(html(<Button href="/reservation">Réserver</Button>)).toMatch(/^<a class="ap-btn[^"]*" href="\/reservation">/);
    expect(html(<Button href="https://example.com">Ext</Button>)).toContain('href="https://example.com"');
  });
  it("disables links without href and marks loading", () => {
    const disabledLink = html(<Button href="/x" disabled>Off</Button>);
    expect(disabledLink).toContain('aria-disabled="true"');
    expect(disabledLink).not.toContain("href=");
    const loading = html(<Button loading loadingLabel="Envoi…">Envoyer</Button>);
    expect(loading).toContain('aria-busy="true"');
    expect(loading).toContain("disabled");
    expect(loading).toContain("Envoi…");
  });
  it("gives icon buttons an accessible name", () => {
    expect(html(<IconButton label="Avis suivant" />)).toContain('aria-label="Avis suivant"');
  });
});

describe("Navigation and content", () => {
  it("marks the current breadcrumb", () => {
    const out = html(<Breadcrumbs items={[{ label: "Accueil", href: "/" }, { label: "Nantes" }]} />);
    expect(out).toContain('aria-label="Fil d’Ariane"');
    expect(out).toContain('<span aria-current="page">Nantes</span>');
  });
  it("numbers steps for screen readers", () => {
    const out = html(<Steps items={[{ icon: "stepReserver", title: "Réservez" }]} />);
    expect(out).toContain('<span class="ap-sr">Étape 1 : </span>Réservez');
  });
  it("labels star ratings", () => {
    expect(html(<Stars value={4} />)).toContain('aria-label="Note : 4 sur 5"');
  });
  it("renders a static heading without the typewriter", () => {
    expect(html(<SectionHeading title="Bonjour !" typing={false} as="h1" />)).toContain('<h1 class="display ap-display">Bonjour <span class="ap-accent">!</span></h1>');
  });
  it("shows the configured contact details in the footer", () => {
    const out = html(<Footer legalLinks={[{ label: "CGV", href: "/cgv" }]} year={2026} />);
    expect(out).toContain(`href="tel:${siteContact.phone.replace(/\s/g, "")}"`);
    expect(out).toContain("2026");
  });
});

describe("Form fields", () => {
  it("links label, help and error, and flags invalid input", () => {
    const out = html(<TextField id="email" label="E-mail" help="Aide" error="Invalide" required />);
    expect(out).toContain('<label class="ap-field__label" for="email">');
    expect(out).toContain('aria-invalid="true"');
    expect(out).toContain('aria-describedby="email-help email-msg"');
    expect(out).toContain('id="email-msg"');
  });
  it("renders a password toggle and a textarea", () => {
    expect(html(<TextField label="Mot de passe" type="password" />)).toContain('aria-pressed="false"');
    expect(html(<TextField label="Message" multiline />)).toContain("<textarea");
  });
  it("renders select options with a placeholder", () => {
    const out = html(<Select label="Parking" placeholder="Choisir" options={["Nantes", { value: "mrs", label: "Marseille" }]} />);
    expect(out).toContain('<option value="">Choisir</option>');
    expect(out).toContain('<option value="mrs">Marseille</option>');
  });
  it("groups date and time under one legend", () => {
    const out = html(<DateTimeField legend="Arrivée" error="Date passée" />);
    expect(out).toContain("<legend>Arrivée");
    expect(out.match(/aria-invalid="true"/g)).toHaveLength(2);
  });
});

describe("Feedback and data", () => {
  it("announces errors as alerts and shows the tone word", () => {
    expect(html(<Alert tone="error">Échec</Alert>)).toContain('role="alert"');
    expect(html(<Alert tone="success">OK</Alert>)).toContain('role="status"');
    expect(html(<Alert tone="warning">x</Alert>)).toContain("Attention");
  });
  it("renders badges and empty states", () => {
    expect(html(<Badge tone="success">Confirmée</Badge>)).toBe('<span class="ap-badge ap-badge--success">Confirmée</span>');
    expect(html(<EmptyState title="Rien" />)).toContain('<p class="ap-empty__title">Rien</p>');
  });
  it("renders accessible tables and their empty state", () => {
    const columns = [{ key: "n", header: "Nom", cell: (r: { n: string }) => r.n }, { key: "m", header: "Montant", cell: () => "1", align: "end" as const }];
    const out = html(<DataTable caption="Clients" rows={[{ n: "A" }]} rowKey={(r) => r.n} columns={columns} />);
    expect(out).toContain('<caption class="ap-sr">Clients</caption>');
    expect(out).toContain('<th scope="col" class="is-num">Montant</th>');
    expect(html(<DataTable caption="Vide" rows={[]} rowKey={() => ""} columns={columns} empty={<p>vide</p>} />)).toBe("<p>vide</p>");
  });
  it("paginates with the current page marked", () => {
    const out = html(<Pagination page={2} totalPages={3} hrefFor={(p) => `/liste?page=${p}`} />);
    expect(out).toContain('aria-current="page"');
    expect(out).toContain('href="/liste?page=3"');
    expect(html(<Pagination page={1} totalPages={1} hrefFor={() => ""} />)).toBe("");
  });
  it("puts trends into words", () => {
    expect(html(<StatTile label="CA" value="1" trend={{ direction: "up", text: "+12 %" }} />)).toContain('<span class="ap-stat__trend ap-stat__trend--up">+12 %</span>');
  });
});

describe("AppShowcase", () => {
  it("escapes the example first name", async () => {
    const { AppShowcase } = await import("../patterns/AppShowcase");
    const out = html(<AppShowcase firstName={'<img src=x onerror="alert(1)">'} />);
    expect(out).not.toContain("<img src=x");
    expect(out).toContain("&lt;img");
  });
});
