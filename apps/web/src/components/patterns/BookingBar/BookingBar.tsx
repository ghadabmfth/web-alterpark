"use client";

import { useId, useRef, useState, useSyncExternalStore, type CSSProperties, type FormEvent, type ReactNode } from "react";
import { cx } from "../../lib/cx";
import { BookingIcon } from "../../icons/glyphs";

export interface BookingOffer {
  id: string;
  name: string;
  short?: string;
  tagline?: string;
  /** prix de départ TTC, en euros */
  from?: number;
  badge?: string;
  highlight?: boolean;
  features: string[];
}
export interface BookingDates {
  date: string;
  time: string;
}
export interface BookingSearch {
  departure: BookingDates;
  return: BookingDates;
  days: number;
  /** offre présélectionnée dans l'interrupteur (bundle : `service`) */
  service?: string;
}
export interface BookingBarProps {
  /**
   * Services affichés dans l'interrupteur et dans les résultats. Le bundle avait deux offres
   * d'exemple par défaut (prix compris) : retirées, les offres viennent du plugin.
   * Liste vide : la barre ne fait que la recherche de dates (résultats affichés par OfferList).
   */
  offers?: BookingOffer[];
  pricing?: (offer: BookingOffer, days: number, search: { dep: BookingDates; ret: BookingDates; days: number }) => number | null;
  /** Arguments sous la barre. Aucun par défaut (le bundle annonçait « paiement à votre retour »). */
  perks?: { icon: "card" | "shield" | "h24"; text: ReactNode }[];
  onSearch?: (s: BookingSearch) => void;
  onSelect?: (s: { offer: BookingOffer; price: number | null; departure: BookingDates; return: BookingDates; days: number }) => void;
  continueHref?: string;
  submitLabel?: string;
  /** offre présélectionnée */
  defaultService?: string;
  className?: string;
}

function today(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 10);
}
const noop = () => () => {};

/** Nombre de jours facturés, arrondi au jour supérieur, minimum 1 (bkDays du bundle). */
export function bookingDays(a: BookingDates, b: BookingDates): number {
  const ms = new Date(`${b.date}T${b.time || "12:00"}`).getTime() - new Date(`${a.date}T${a.time || "12:00"}`).getTime();
  return Math.max(1, Math.ceil(ms / 86400000));
}
function fmtDate(d: string): string {
  return d ? new Date(`${d}T12:00`).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" }) : "";
}
function euro(n: number): string {
  return `${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`;
}

/* Barre de réservation : départ et retour (date + heure), puis les services avec leur prix.
   `pricing(offre, jours)` renvoie le prix TTC ; à brancher sur le moteur de tarifs. */
export function BookingBar({ offers = [], pricing, perks = [], onSearch, onSelect, continueHref, submitLabel, defaultService, className }: BookingBarProps) {
  const uid = useId();
  const [v, setV] = useState({ dep: { date: "", time: "" }, ret: { date: "", time: "" } });
  const [err, setErr] = useState("");
  const [res, setRes] = useState<{ days: number; dep: BookingDates; ret: BookingDates } | null>(null);
  const [chosen, setChosen] = useState(defaultService || (offers.find((o) => o.highlight) || offers[0])?.id || "");
  const resRef = useRef<HTMLDivElement>(null);
  const min = useSyncExternalStore(noop, today, () => "");
  const label = submitLabel || "Rechercher";

  const upd = (k: "dep" | "ret", f: "date" | "time", val: string) => {
    setV((cur) => ({ ...cur, [k]: { ...cur[k], [f]: val } }));
    setErr("");
  };
  const submit = (ev: FormEvent) => {
    ev.preventDefault();
    if (!v.dep.date || !v.ret.date) {
      setErr("Indiquez vos dates de départ et de retour.");
      return;
    }
    const a = new Date(`${v.dep.date}T${v.dep.time || "00:00"}`);
    const b = new Date(`${v.ret.date}T${v.ret.time || "23:59"}`);
    if (b <= a) {
      setErr("La date de retour doit être après la date de départ.");
      return;
    }
    const days = bookingDays(v.dep, v.ret);
    setRes({ days, dep: v.dep, ret: v.ret });
    onSearch?.({ departure: v.dep, return: v.ret, days, service: chosen || undefined });
    setTimeout(() => resRef.current?.focus(), 60);
  };

  const field = (k: "dep" | "ret", text: string, icon: "dep" | "ret") => {
    const d = v[k];
    return (
      <div className="ap-bk__group" role="group" aria-labelledby={`${uid}${k}l`}>
        <span className="ap-bk__label" id={`${uid}${k}l`}>
          <BookingIcon name={icon} className="ap-bk__plane" />
          {text}
        </span>
        <div className="ap-bk__inputs">
          <label className="ap-bk__field">
            <span className="ap-sr">{`${text}, date`}</span>
            <input
              id={`${uid}${k}d`}
              type="date"
              required
              min={k === "ret" && v.dep.date ? v.dep.date : min || undefined}
              value={d.date}
              onChange={(x) => upd(k, "date", x.target.value)}
            />
            <BookingIcon name="cal" />
          </label>
          <BookingIcon name="arrow" className="ap-bk__sep" />
          <label className="ap-bk__field ap-bk__field--time">
            <span className="ap-sr">{`${text}, heure`}</span>
            <input id={`${uid}${k}t`} type="time" value={d.time} onChange={(x) => upd(k, "time", x.target.value)} />
            <BookingIcon name="clock" />
          </label>
        </div>
      </div>
    );
  };

  /* Choix du service : interrupteur à positions, avec indicateur glissant. */
  const ci = Math.max(0, offers.findIndex((o) => o.id === chosen));
  const tabs = offers.length ? (
    <div className="ap-bk__switch" role="radiogroup" aria-label="Choix du parking" style={{ "--n": offers.length, "--k": ci } as CSSProperties}>
      <span className="ap-bk__thumb" aria-hidden />
      {offers.map((o, i) => {
        const on = i === ci;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={on}
            tabIndex={on ? 0 : -1}
            className={cx("ap-bk__opt", on && "is-on")}
            onClick={() => setChosen(o.id)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const n = offers[(i + (e.key === "ArrowRight" ? 1 : offers.length - 1)) % offers.length]!;
                setChosen(n.id);
                const el = e.currentTarget.parentNode?.querySelectorAll<HTMLElement>(".ap-bk__opt")[offers.indexOf(n)];
                el?.focus();
              }
            }}
          >
            <span className="ap-bk__opt-main">
              <b>{o.short || o.name}</b>
              {o.badge ? <span className="ap-bk__opt-badge">{`★ ${o.badge.replace(/\s*!$/, "")}`}</span> : null}
            </span>
            <span className="ap-bk__opt-sub">
              {o.tagline || o.features[0]}
              {o.from != null ? (
                <span className="ap-bk__opt-price">
                  dès <b>{euro(o.from)}</b>
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  ) : null;

  return (
    <div className={cx("ap-root ap-bk", res && "has-results", className)}>
      {tabs}
      <form className="ap-bk__bar" onSubmit={submit} noValidate aria-label="Rechercher une place">
        {field("dep", "Date de départ", "dep")}
        <span className="ap-bk__divider" aria-hidden />
        {field("ret", "Date de retour", "ret")}
        <button type="submit" className="ap-bk__submit" aria-label={label} title={label}>
          <BookingIcon name="search" className="ap-bk__search" />
          <span className="ap-bk__submit-txt">{label}</span>
        </button>
      </form>
      {err ? (
        <p className="ap-bk__error" role="alert">
          {err}
        </p>
      ) : null}
      {perks.length ? (
        <ul className="ap-bk__perks">
          {perks.map((it, i) => (
            <li key={i}>
              <BookingIcon name={it.icon} />
              <span>{it.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {res && offers.length ? (
        <div className="ap-bk__results" ref={resRef} tabIndex={-1} aria-live="polite">
          <p className="ap-bk__summary">
            Du <b>{fmtDate(res.dep.date) + (res.dep.time ? ` · ${res.dep.time}` : "")}</b> au{" "}
            <b>{fmtDate(res.ret.date) + (res.ret.time ? ` · ${res.ret.time}` : "")}</b> —{" "}
            <b className="ap-bk__days">{res.days + (res.days > 1 ? " jours" : " jour")}</b>
          </p>
          <div className="ap-bk__offers">
            {offers.map((o, i) => {
              const price = pricing ? pricing(o, res.days, res) : null;
              const on = chosen === o.id;
              return (
                <article key={o.id} className={cx("ap-bk__offer", o.highlight && "is-highlight", on && "is-chosen")} style={{ "--i": i } as CSSProperties}>
                  {o.badge ? <span className="ap-bk__badge">{o.badge}</span> : null}
                  <h3 className="ap-bk__name">{o.name}</h3>
                  <ul className="ap-bk__features">
                    {o.features.map((f, j) => (
                      <li key={j}>
                        <BookingIcon name="check" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <p className="ap-bk__price">
                    {price == null ? (
                      o.from != null ? (
                        <>
                          <small>À partir de</small>
                          <b>{euro(o.from)}</b>
                          <small>TTC</small>
                        </>
                      ) : (
                        <span className="ap-bk__price-na">Tarif à l’étape suivante</span>
                      )
                    ) : (
                      <>
                        <b>{euro(price)}</b>
                        <small>{`TTC · ${res.days}${res.days > 1 ? " jours" : " jour"}`}</small>
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    className={cx("ap-btn ap-btn--md", on ? "ap-btn--secondary" : "ap-btn--primary", "ap-bk__choose")}
                    aria-pressed={on}
                    onClick={() => {
                      setChosen(o.id);
                      onSelect?.({ offer: o, price, departure: res.dep, return: res.ret, days: res.days });
                    }}
                  >
                    <span>{on ? "Sélectionné" : "Sélectionner"}</span>
                    <BookingIcon name={on ? "check" : "plane"} className="ap-bk__btn-ico" />
                  </button>
                </article>
              );
            })}
          </div>
          {chosen && continueHref ? (
            <a className="ap-bk__continue" href={continueHref}>
              Continuer la réservation
              <BookingIcon name="arrow" />
            </a>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
