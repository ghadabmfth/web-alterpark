"use client";

import { useId, useRef, useState, type CSSProperties, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { cx } from "../lib/cx";
import { formatEuro } from "../lib/format";
import { useMounted } from "../lib/mounted";
import { SmartLink } from "../lib/link";
import { BookingIcon } from "../icons/sets";
import { bookingDays, formatShortDay, localToday, searchError, type BookingDates } from "./booking-bar-logic";

/*
 * BookingBar — design system "Patterns". Orange search bar: service switch (two positions with a
 * sliding thumb, arrow keys), departure and return (date + time), search, selling points; after
 * the search, a summary and one card per service with its price and a select button.
 * Offers, prices and selling points are business data: they are required props, never defaults.
 * `pricing` returns a display price; the server recomputes it at checkout.
 */
export interface BookingOffer {
  id: string;
  name: string;
  short?: string;
  tagline?: string;
  /** Starting price incl. VAT, in euros. */
  from?: number;
  badge?: string;
  highlight?: boolean;
  features: string[];
}

export interface BookingSearch {
  departure: BookingDates;
  return: BookingDates;
  days: number;
  service: string;
}

export interface BookingBarProps {
  offers: BookingOffer[];
  perks: { icon: "card" | "shield" | "h24"; text: ReactNode }[];
  pricing?: (offer: BookingOffer, days: number, search: { dep: BookingDates; ret: BookingDates; days: number }) => number | null;
  onSearch?: (s: BookingSearch) => void;
  onSelect?: (s: { offer: BookingOffer; price: number | null; departure: BookingDates; return: BookingDates; days: number }) => void;
  continueHref?: string;
  submitLabel?: string;
  /** Preselected service id. */
  defaultService?: string;
  className?: string;
}

const EMPTY: BookingDates = { date: "", time: "" };

export function BookingBar({ offers, perks, pricing, onSearch, onSelect, continueHref, submitLabel = "Rechercher", defaultService, className }: BookingBarProps) {
  const uid = useId();
  const mounted = useMounted();
  const [dates, setDates] = useState<{ dep: BookingDates; ret: BookingDates }>({ dep: EMPTY, ret: EMPTY });
  const [error, setError] = useState("");
  const [result, setResult] = useState<{ days: number; dep: BookingDates; ret: BookingDates } | null>(null);
  const [chosen, setChosen] = useState(defaultService ?? (offers.find((o) => o.highlight) ?? offers[0])?.id ?? "");
  const resultsRef = useRef<HTMLDivElement>(null);
  const today = mounted ? localToday() : undefined;

  const update = (k: "dep" | "ret", f: keyof BookingDates, value: string) => {
    setDates((d) => ({ ...d, [k]: { ...d[k], [f]: value } }));
    setError("");
  };

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = searchError(dates.dep, dates.ret);
    if (err) {
      setError(err);
      return;
    }
    const days = bookingDays(dates.dep, dates.ret);
    setResult({ days, dep: dates.dep, ret: dates.ret });
    onSearch?.({ departure: dates.dep, return: dates.ret, days, service: chosen });
    setTimeout(() => resultsRef.current?.focus(), 60);
  };

  const field = (k: "dep" | "ret", label: string, icon: "dep" | "ret") => {
    const d = dates[k];
    return (
      <div className="ap-bk__group" role="group" aria-labelledby={`${uid}${k}l`}>
        <span className="ap-bk__label" id={`${uid}${k}l`}>
          <BookingIcon name={icon} className="ap-bk__plane" />
          {label}
        </span>
        <div className="ap-bk__inputs">
          <label className="ap-bk__field">
            <span className="ap-sr">{`${label}, date`}</span>
            <input
              id={`${uid}${k}d`}
              type="date"
              required
              min={k === "ret" && dates.dep.date ? dates.dep.date : today}
              value={d.date}
              onChange={(x) => update(k, "date", x.target.value)}
            />
            <BookingIcon name="cal" />
          </label>
          <BookingIcon name="arrow" className="ap-bk__sep" />
          <label className="ap-bk__field ap-bk__field--time">
            <span className="ap-sr">{`${label}, heure`}</span>
            <input id={`${uid}${k}t`} type="time" value={d.time} onChange={(x) => update(k, "time", x.target.value)} />
            <BookingIcon name="clock" />
          </label>
        </div>
      </div>
    );
  };

  const ci = Math.max(0, offers.findIndex((o) => o.id === chosen));
  const onSwitchKey = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = offers[(i + (e.key === "ArrowRight" ? 1 : offers.length - 1)) % offers.length]!;
    setChosen(next.id);
    const el = e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>(".ap-bk__opt")[offers.indexOf(next)];
    el?.focus();
  };

  return (
    <div className={cx("ap-root ap-bk", !!result && "has-results", className)}>
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
              onKeyDown={(e) => onSwitchKey(e, i)}
            >
              <span className="ap-bk__opt-main">
                <b>{o.short ?? o.name}</b>
                {o.badge ? <span className="ap-bk__opt-badge">{`★ ${o.badge.replace(/\s*!$/, "")}`}</span> : null}
              </span>
              <span className="ap-bk__opt-sub">
                {o.tagline ?? o.features[0]}
                {o.from != null ? (
                  <span className="ap-bk__opt-price">
                    dès <b>{formatEuro(o.from)}</b>
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>
      <form className="ap-bk__bar" onSubmit={submit} noValidate aria-label="Rechercher une place">
        {field("dep", "Date de départ", "dep")}
        <span className="ap-bk__divider" aria-hidden />
        {field("ret", "Date de retour", "ret")}
        <button type="submit" className="ap-bk__submit" aria-label={submitLabel} title={submitLabel}>
          <BookingIcon name="search" className="ap-bk__search" />
          <span className="ap-bk__submit-txt">{submitLabel}</span>
        </button>
      </form>
      {error ? (
        <p className="ap-bk__error" role="alert">{error}</p>
      ) : null}
      <ul className="ap-bk__perks">
        {perks.map((it, i) => (
          <li key={i}>
            <BookingIcon name={it.icon} />
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
      {result ? (
        <div className="ap-bk__results" ref={resultsRef} tabIndex={-1} aria-live="polite">
          <p className="ap-bk__summary">
            Du <b>{formatShortDay(result.dep.date) + (result.dep.time ? ` · ${result.dep.time}` : "")}</b> au{" "}
            <b>{formatShortDay(result.ret.date) + (result.ret.time ? ` · ${result.ret.time}` : "")}</b> —{" "}
            <b className="ap-bk__days">{`${result.days} ${result.days > 1 ? "jours" : "jour"}`}</b>
          </p>
          <div className="ap-bk__offers">
            {offers.map((o, i) => {
              const price = pricing ? pricing(o, result.days, result) : null;
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
                          <b>{formatEuro(o.from)}</b>
                          <small>TTC</small>
                        </>
                      ) : (
                        <span className="ap-bk__price-na">Tarif à l’étape suivante</span>
                      )
                    ) : (
                      <>
                        <b>{formatEuro(price)}</b>
                        <small>{`TTC · ${result.days} ${result.days > 1 ? "jours" : "jour"}`}</small>
                      </>
                    )}
                  </p>
                  <button
                    type="button"
                    className={cx("ap-btn ap-btn--md", on ? "ap-btn--secondary" : "ap-btn--primary", "ap-bk__choose")}
                    aria-pressed={on}
                    onClick={() => {
                      setChosen(o.id);
                      onSelect?.({ offer: o, price, departure: result.dep, return: result.ret, days: result.days });
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
            <SmartLink className="ap-bk__continue" href={continueHref}>
              Continuer la réservation
              <BookingIcon name="arrow" />
            </SmartLink>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
