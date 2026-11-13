import type { CSSProperties, ReactNode } from "react";
import { cx } from "../../lib/cx";

export interface AppShowcaseProps {
  /** prénom affiché (exemple) */
  firstName?: string;
  /** pastilles flottantes (défaut true) */
  badges?: boolean;
  label?: string;
  className?: string;
}

/* Illustration du design system (role="img") : deux téléphones, l'accueil de l'app et le parcours
   de réservation en 4 étapes, animés en boucle. Les valeurs affichées font partie du visuel.
   Porté depuis le HTML généré par bundle.js (apscMarkup) en JSX, à l'identique. */

/** Motif décoratif façon QR (pas un vrai code) : 3 repères + modules pseudo-aléatoires. */
function Qr({ n, seed }: { n: number; seed: number }) {
  let s = seed;
  const rnd = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
  const cells: ReactNode[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      const inF = (i < 8 && j < 8) || (i < 8 && j > n - 9) || (i > n - 9 && j < 8);
      if (!inF && rnd() > 0.52) cells.push(<rect key={`${i}-${j}`} x={j} y={i} width="1" height="1" />);
    }
  }
  return (
    <svg viewBox={`0 0 ${n} ${n}`} fill="#313131" shapeRendering="crispEdges">
      {cells}
      <rect x=".5" y=".5" width="6" height="6" fill="none" stroke="#313131" />
      <rect x="2" y="2" width="3" height="3" />
      <rect x={n - 6.5} y=".5" width="6" height="6" fill="none" stroke="#313131" />
      <rect x={n - 5} y="2" width="3" height="3" />
      <rect x=".5" y={n - 6.5} width="6" height="6" fill="none" stroke="#313131" />
      <rect x="2" y={n - 5} width="3" height="3" />
    </svg>
  );
}

const LINE = { fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const Ico = {
  home: (
    <svg viewBox="0 0 24 24" {...LINE}>
      <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6h-6v6H5a1 1 0 0 1-1-1z" />
    </svg>
  ),
  cal: (
    <svg viewBox="0 0 24 24" {...LINE}>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
    </svg>
  ),
  ticket: (
    <svg viewBox="0 0 24 24" {...LINE}>
      <path d="M4 8a2 2 0 0 0 0 4v4h16v-4a2 2 0 0 1 0-4V4H4z" />
      <path d="M13 4v12" strokeDasharray="2 2" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" {...LINE}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c1.5-4 4.5-6 8-6s6.5 2 8 6" />
    </svg>
  ),
  bus: (
    <svg viewBox="0 0 24 24" {...LINE}>
      <rect x="4" y="3" width="16" height="15" rx="3" />
      <path d="M4 11h16M7 21v-3M17 21v-3" />
      <circle cx="8" cy="14.5" r=".6" fill="currentColor" />
      <circle cx="16" cy="14.5" r=".6" fill="currentColor" />
    </svg>
  ),
  gift: (
    <svg viewBox="0 0 24 24" {...LINE}>
      <rect x="3" y="8" width="18" height="4" rx="1" />
      <path d="M5 12v8h14v-8M12 8v12M12 8c-2-4-6-4-6-1.5S9 8 12 8c3 0 6 1 6-1.5S14 4 12 8" />
    </svg>
  ),
  car: (
    <svg viewBox="0 0 64 34" fill="currentColor">
      <path d="M10 14l7-9c1.4-1.8 3.3-3 6-3h16c2.6 0 4.7 1 6.3 3l7.2 9H58a5 5 0 0 1 5 5v7a2 2 0 0 1-2 2h-4a7 7 0 0 0-14 0H21a7 7 0 0 0-14 0H3a2 2 0 0 1-2-2v-7a5 5 0 0 1 5-5zm10 0h12V7h-8.2a2 2 0 0 0-1.6.8zm16 0h12.4l-4.6-6a2 2 0 0 0-1.6-1H36z" />
      <circle cx="14" cy="28" r="5" />
      <circle cx="50" cy="28" r="5" />
    </svg>
  ),
};

function Calendar() {
  const out: ReactNode[] = ["L", "M", "M", "J", "V", "S", "D"].map((d, i) => <b key={`h${i}`}>{d}</b>);
  for (let d = 0; d < 5; d++) out.push(<span key={`e${d}`} />);
  for (let d = 1; d <= 31; d++) {
    const cls = d >= 12 && d <= 20 ? (d === 12 || d === 20 ? `end ${d === 12 ? "start" : "stop"}` : "in") : "";
    out.push(
      cls ? (
        <span key={d} className={cls} style={{ "--d": d - 12 } as CSSProperties}>
          {d}
        </span>
      ) : (
        <span key={d}>{d}</span>
      ),
    );
  }
  return <>{out}</>;
}

function Status() {
  return (
    <div className="apsc__status">
      <span>9:41</span>
      <span>
        5G
        <i />
      </span>
    </div>
  );
}

function Brand() {
  return (
    <div className="apsc__brand">
      Alter
      <br />
      Park<b>.</b>
    </div>
  );
}

/** Deux téléphones : l'accueil de l'app et le parcours de réservation en 4 étapes, animés en boucle. */
export function AppShowcase({ firstName, badges, label, className }: AppShowcaseProps) {
  const name = firstName || "Claire";
  return (
    <div
      className={cx("ap-root apsc", className)}
      role="img"
      aria-label={label || "Aperçu de l’application ALTERPARK : réservation en 4 étapes (dates, véhicule, récapitulatif, confirmation avec billet)."}
    >
      <div className="apsc__stage">
        <div className="apsc__glow" />
        <div className="apsc__phone apsc__phone--back">
          <div className="apsc__body">
            <div className="apsc__screen">
              <div className="apsc__island" />
              <Status />
              <div className="apsc__appbar">
                <Brand />
                <div className="apsc__avatar">{name.charAt(0)}</div>
              </div>
              <div className="apsc__content">
                <div className="apsc-hello">
                  <span>Bonjour {name}</span>Prêt pour le départ ?
                </div>
                <div className="apsc-card apsc-next">
                  <div>
                    <div className="apsc-label">Prochain départ</div>
                    <div className="apsc-val">Mar. 12 août · 06:30</div>
                  </div>
                  <div className="apsc-qr-mini">
                    <Qr n={21} seed={3} />
                  </div>
                  <div className="apsc-chip">
                    <span className="apsc-dot" />
                    P11 · place 42
                  </div>
                </div>
                <div className="apsc-card apsc-map">
                  <svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice">
                    <rect width="200" height="110" fill="#3a3a3a" />
                    <path d="M-5 30 L60 42 L120 20 L210 34" stroke="#4a4a4a" strokeWidth="7" fill="none" />
                    <path d="M40 120 L70 60 L60 -10" stroke="#4a4a4a" strokeWidth="6" fill="none" />
                    <path d="M110 120 L130 70 L190 -5" stroke="#4a4a4a" strokeWidth="5" fill="none" />
                    <rect x="140" y="58" width="44" height="30" rx="4" fill="#454545" />
                    <rect x="18" y="62" width="30" height="22" rx="3" fill="#454545" />
                    <path className="apsc-route" d="M150 73 C130 70 120 62 100 58 S70 54 66 66" stroke="#f6921e" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle className="apsc-pin-ring" cx="66" cy="66" r="9" fill="rgba(246,146,30,.35)" />
                    <g className="apsc-pin">
                      <path d="M66 68 C60 58 58 55 58 51 a8 8 0 0 1 16 0 c0 4-2 7-8 17z" fill="#f6921e" />
                      <circle cx="66" cy="51" r="3" fill="#313131" />
                    </g>
                    <circle cx="150" cy="73" r="4" fill="#fff" />
                  </svg>
                  <span className="apsc-chip">
                    <span className="apsc-dot" />
                    Accueil ouvert 24h/24
                  </span>
                </div>
                <div className="apsc-card apsc-points">
                  <div className="apsc-points__row">
                    <span className="apsc-label">Points fidélité</span>
                    <b>
                      1 240 <small>/ 1 500</small>
                    </b>
                  </div>
                  <div className="apsc-bar">
                    <i />
                  </div>
                </div>
              </div>
              <div className="apsc-nav">
                <span className="is-on">{Ico.home}Accueil</span>
                <span>{Ico.cal}Réserver</span>
                <span>{Ico.ticket}Billets</span>
                <span>{Ico.user}Profil</span>
              </div>
            </div>
          </div>
        </div>
        <div className="apsc__phone apsc__phone--front">
          <div className="apsc__body">
            <div className="apsc__screen">
              <div className="apsc__island" />
              <Status />
              <div className="apsc__appbar">
                <Brand />
                <div className="apsc-chip">Nantes Atlantique</div>
              </div>
              <div className="apsc-steps">
                <div className="apsc-steps__top">
                  {[
                    ["Vos dates", "1 / 4"],
                    ["Votre véhicule", "2 / 4"],
                    ["Récapitulatif", "3 / 4"],
                    ["C’est réservé", "4 / 4"],
                  ].map(([t, n]) => (
                    <div key={n} className="apsc-steps__label">
                      <b>{t}</b>
                      <small>{n}</small>
                    </div>
                  ))}
                </div>
                <div className="apsc-progress">
                  <i />
                </div>
              </div>
              <div className="apsc-flow">
                <div className="apsc-pane">
                  <div className="apsc-dates">
                    <div className="apsc-card">
                      <div className="apsc-label">Départ</div>
                      <div className="apsc-val">12 août · 06:30</div>
                    </div>
                    <div className="apsc-card">
                      <div className="apsc-label">Retour</div>
                      <div className="apsc-val">20 août · 22:10</div>
                    </div>
                  </div>
                  <div className="apsc-card apsc-cal">
                    <div className="apsc-cal__head">
                      Août 2026 <span>‹ ›</span>
                    </div>
                    <div className="apsc-cal__grid">
                      <Calendar />
                    </div>
                  </div>
                  <span className="apsc-chip is-on apsc-days">8 jours · ALTERECO</span>
                  <div className="apsc-btn">Continuer</div>
                </div>
                <div className="apsc-pane">
                  <div className="apsc-car">
                    {Ico.car}
                    <div>
                      <div className="apsc-label">Votre véhicule</div>
                      <div className="apsc-val">Citadine</div>
                    </div>
                  </div>
                  <div className="apsc-field is-focus">
                    <div className="apsc-label">Immatriculation</div>
                    <div className="apsc-plate">
                      <span className="apsc-plate__eu">F</span>
                      <span className="apsc-plate__txt">AB-123-CD</span>
                      <span className="apsc-caret" />
                    </div>
                  </div>
                  <div className="apsc-chips">
                    <span className="apsc-chip is-on">Citadine</span>
                    <span className="apsc-chip">SUV</span>
                    <span className="apsc-chip">Monospace</span>
                  </div>
                  <div className="apsc-field apsc-row">
                    <div>
                      <div className="apsc-label">Passagers</div>
                      <div className="apsc-val">2 personnes</div>
                    </div>
                    <div className="apsc-stepper">
                      <i>−</i>
                      <i>+</i>
                    </div>
                  </div>
                  <div className="apsc-note">Véhicules hors gabarit : hauteur max 2,50 m, longueur max 5,50 m.</div>
                  <div className="apsc-btn">Continuer</div>
                </div>
                <div className="apsc-pane">
                  <div className="apsc-card apsc-lines">
                    <div className="apsc-row">
                      <span>Formule</span>
                      <b>ALTERECO</b>
                    </div>
                    <div className="apsc-row">
                      <span>Durée</span>
                      <b>8 jours</b>
                    </div>
                    <div className="apsc-row">
                      <span>Stationnement</span>
                      <b>57,60 €</b>
                    </div>
                    <div className="apsc-row is-promo">
                      <span>Points fidélité (1 200)</span>
                      <b>− 12,00 €</b>
                    </div>
                    <hr />
                    <div className="apsc-row">
                      <span>Total TTC</span>
                      <b className="apsc-total">45,60 €</b>
                    </div>
                  </div>
                  <div className="apsc-card apsc-row">
                    <div>
                      <div className="apsc-label">Utiliser mes points</div>
                      <div className="apsc-val">1 240 disponibles</div>
                    </div>
                    <span className="apsc-toggle" />
                  </div>
                  <div className="apsc-card apsc-pay">
                    <i />
                    <div>
                      <b>Visa •••• 4242</b>
                      <div className="apsc-note">Paiement sécurisé</div>
                    </div>
                  </div>
                  <div className="apsc-btn">Payer 45,60 €</div>
                </div>
                <div className="apsc-pane apsc-done">
                  <svg className="apsc-check" viewBox="0 0 60 60" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="30" cy="30" r="25" />
                    <path d="M19 31l7 7 15-16" />
                  </svg>
                  <h4>Place réservée !</h4>
                  <p>Un e-mail de confirmation vous a été envoyé.</p>
                  <div className="apsc-ticket">
                    <div>
                      <div className="apsc-label">Arrivée</div>
                      <div className="apsc-val">Mar. 12 août · 06:30</div>
                      <div className="apsc-label" style={{ marginTop: ".5em" }}>
                        Parking
                      </div>
                      <div className="apsc-val">P11 · place 42</div>
                    </div>
                    <div className="apsc-qr">
                      <Qr n={21} seed={11} />
                    </div>
                  </div>
                  <div className="apsc-btn apsc-btn--ghost" style={{ width: "100%", marginTop: "auto" }}>
                    Ajouter au calendrier
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {badges === false ? null : (
          <>
            <div className="apsc__badge apsc__badge--a">
              <span className="apsc__badge-ico">{Ico.bus}</span>
              <span>
                <b>Navette gratuite</b>
                <small>Terminal en 15 min</small>
              </span>
            </div>
            <div className="apsc__badge apsc__badge--b">
              <span className="apsc__badge-ico">{Ico.gift}</span>
              <span>
                <b>− 12 € fidélité</b>
                <small>1 200 points utilisés</small>
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
