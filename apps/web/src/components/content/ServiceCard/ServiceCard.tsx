import { cx } from "../../lib/cx";
import type { Href } from "../../lib/types";
import { ServiceIcon, type ServiceIconName } from "../../icons/glyphs";
import { Button } from "../../actions/Button/Button";
import { formatEuros } from "../../lib/format";


export interface ServiceCardProps {
  id?: string;
  icon: ServiceIconName;
  title: string;
  titleAs?: "h2" | "h3";
  /** nombre (euros) → « 49,00 € » + note ; texte → pastille (ex. « Devis gratuit ») */
  price?: number | string;
  priceNote?: string;
  badge?: string;
  /** contour orange (offre mise en avant) */
  featured?: boolean;
  tagline?: string;
  intro?: string;
  items?: { title: string; text?: string; lines?: { label: string; text: string }[] }[];
  notes?: string[];
  cta?: Href;
  className?: string;
}

/** Carte de service : pictogramme, nom, prix TTC, accroche, détail des prestations, notes. */
export function ServiceCard({ id, icon, title, titleAs: T = "h3", price, priceNote, badge, featured, tagline, intro, items, notes, cta, className }: ServiceCardProps) {
  return (
    <article className={cx("ap-root ap-svc", featured && "is-featured", className)} id={id}>
      <div className="ap-svc__head">
        <ServiceIcon name={icon} className="ap-svc__ico" />
        {badge ? <span className="ap-svc__badge">{badge}</span> : null}
      </div>
      <div className="ap-svc__titlebar">
        <T className="ap-svc__title">{title}</T>
        {price != null ? (
          <p className="ap-svc__price">
            {typeof price === "number" ? (
              <>
                <b>{formatEuros(Math.round(price * 100))}</b>
                <small>{priceNote || "TTC"}</small>
              </>
            ) : (
              <b className="ap-svc__price-txt">{price}</b>
            )}
          </p>
        ) : null}
      </div>
      {tagline ? <p className="ap-svc__tagline">{tagline}</p> : null}
      {intro ? <p className="ap-svc__intro">{intro}</p> : null}
      {items?.length ? (
        <ul className="ap-svc__items">
          {items.map((it, i) => (
            <li key={i}>
              <b>{it.title}</b>
              {it.text ? <span>{it.text}</span> : null}
              {it.lines ? (
                <ul className="ap-svc__lines">
                  {it.lines.map((l, j) => (
                    <li key={j}>
                      <strong>{`${l.label} : `}</strong>
                      {l.text}
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
      {notes?.length ? (
        <ul className="ap-svc__notes">
          {notes.map((n, i) => (
            <li key={i}>{n}</li>
          ))}
        </ul>
      ) : null}
      {cta ? (
        <div className="ap-svc__cta">
          <Button href={cta.href} onClick={cta.onClick} size="sm">
            {cta.label}
          </Button>
        </div>
      ) : null}
    </article>
  );
}
