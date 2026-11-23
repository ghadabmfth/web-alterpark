/* eslint-disable */
/*
 * AppShowcase illustration markup — VERBATIM from docs/design-system/reference/bundle.js
 * (apscQr, apscCalendar, apscMarkup), with TypeScript annotations only. Do not edit.
 * Decorative: rendered with role="img" and a text alternative by the AppShowcase component.
 */
import { APP_SHOWCASE_ICONS as APSC_ICO } from "../icons/svg-data";

function esc(t: string): string {
  return String(t).replace(/[&<>"]/g, function (c) { return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' } as Record<string, string>)[c]!; });
}

  function apscQr(n: number, seed?: number): string {
    /* Motif décoratif façon QR (pas un vrai code) : 3 repères + modules pseudo-aléatoires. */
    var s = seed || 7, r = '', i: number, j: number;
    function rnd() { s = (s * 9301 + 49297) % 233280; return s / 233280; }
    function finder(x: number, y: number) { return '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="none" stroke="#313131" stroke-width="1" transform="translate(.5 .5) scale(.857)"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; }
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) {
      var inF = (i < 8 && j < 8) || (i < 8 && j > n - 9) || (i > n - 9 && j < 8);
      if (!inF && rnd() > 0.52) r += '<rect x="' + j + '" y="' + i + '" width="1" height="1"/>';
    }
    return '<svg viewBox="0 0 ' + n + ' ' + n + '" fill="#313131" shape-rendering="crispEdges">' + r +
      '<rect x=".5" y=".5" width="6" height="6" fill="none" stroke="#313131"/><rect x="2" y="2" width="3" height="3"/>' +
      '<rect x="' + (n - 6.5) + '" y=".5" width="6" height="6" fill="none" stroke="#313131"/><rect x="' + (n - 5) + '" y="2" width="3" height="3"/>' +
      '<rect x=".5" y="' + (n - 6.5) + '" width="6" height="6" fill="none" stroke="#313131"/><rect x="2" y="' + (n - 5) + '" width="3" height="3"/></svg>';
  }
  function apscCalendar(): string {
    var out = '<b>L</b><b>M</b><b>M</b><b>J</b><b>V</b><b>S</b><b>D</b>', d: number;
    for (d = 0; d < 5; d++) out += '<span></span>';
    for (d = 1; d <= 31; d++) {
      var cls = d >= 12 && d <= 20 ? (d === 12 || d === 20 ? 'end ' + (d === 12 ? 'start' : 'stop') : 'in') : '';
      out += '<span' + (cls ? ' class="' + cls + '" style="--d:' + (d - 12) + '"' : '') + '>' + d + '</span>';
    }
    return out;
  }
  export function apscMarkup(p: { firstName?: string; badges?: boolean }): string {
    var name = p.firstName || 'Claire';
    var status = '<div class="apsc__status"><span>9:41</span><span>5G<i></i></span></div>';
    var brand = '<div class="apsc__brand">Alter<br>Park<b>.</b></div>';
    var back =
      '<div class="apsc__phone apsc__phone--back"><div class="apsc__body"><div class="apsc__screen"><div class="apsc__island"></div>' + status +
      '<div class="apsc__appbar">' + brand + '<div class="apsc__avatar">' + esc(name.charAt(0)) + '</div></div>' +
      '<div class="apsc__content">' +
        '<div class="apsc-hello"><span>Bonjour ' + esc(name) + '</span>Prêt pour le départ ?</div>' +
        '<div class="apsc-card apsc-next"><div><div class="apsc-label">Prochain départ</div><div class="apsc-val">Mar. 12 août · 06:30</div></div><div class="apsc-qr-mini">' + apscQr(21, 3) + '</div><div class="apsc-chip"><span class="apsc-dot"></span>P11 · place 42</div></div>' +
        '<div class="apsc-card apsc-map"><svg viewBox="0 0 200 110" preserveAspectRatio="xMidYMid slice"><rect width="200" height="110" fill="#3a3a3a"/>' +
          '<path d="M-5 30 L60 42 L120 20 L210 34" stroke="#4a4a4a" stroke-width="7" fill="none"/><path d="M40 120 L70 60 L60 -10" stroke="#4a4a4a" stroke-width="6" fill="none"/><path d="M110 120 L130 70 L190 -5" stroke="#4a4a4a" stroke-width="5" fill="none"/>' +
          '<rect x="140" y="58" width="44" height="30" rx="4" fill="#454545"/><rect x="18" y="62" width="30" height="22" rx="3" fill="#454545"/>' +
          '<path class="apsc-route" d="M150 73 C130 70 120 62 100 58 S70 54 66 66" stroke="#f6921e" stroke-width="3" fill="none" stroke-linecap="round"/>' +
          '<circle class="apsc-pin-ring" cx="66" cy="66" r="9" fill="rgba(246,146,30,.35)"/><g class="apsc-pin"><path d="M66 68 C60 58 58 55 58 51 a8 8 0 0 1 16 0 c0 4-2 7-8 17z" fill="#f6921e"/><circle cx="66" cy="51" r="3" fill="#313131"/></g>' +
          '<circle cx="150" cy="73" r="4" fill="#fff"/></svg><span class="apsc-chip"><span class="apsc-dot"></span>Accueil ouvert 24h/24</span></div>' +
        '<div class="apsc-card apsc-points"><div class="apsc-points__row"><span class="apsc-label">Points fidélité</span><b>1 240 <small>/ 1 500</small></b></div><div class="apsc-bar"><i></i></div></div>' +
      '</div>' +
      '<div class="apsc-nav"><span class="is-on">' + APSC_ICO.home + 'Accueil</span><span>' + APSC_ICO.cal + 'Réserver</span><span>' + APSC_ICO.ticket + 'Billets</span><span>' + APSC_ICO.user + 'Profil</span></div>' +
      '</div></div></div>';
    var front =
      '<div class="apsc__phone apsc__phone--front"><div class="apsc__body"><div class="apsc__screen"><div class="apsc__island"></div>' + status +
      '<div class="apsc__appbar">' + brand + '<div class="apsc-chip">Nantes Atlantique</div></div>' +
      '<div class="apsc-steps"><div class="apsc-steps__top">' +
        '<div class="apsc-steps__label"><b>Vos dates</b><small>1 / 4</small></div>' +
        '<div class="apsc-steps__label"><b>Votre véhicule</b><small>2 / 4</small></div>' +
        '<div class="apsc-steps__label"><b>Récapitulatif</b><small>3 / 4</small></div>' +
        '<div class="apsc-steps__label"><b>C’est réservé</b><small>4 / 4</small></div>' +
      '</div><div class="apsc-progress"><i></i></div></div>' +
      '<div class="apsc-flow">' +
        '<div class="apsc-pane"><div class="apsc-dates"><div class="apsc-card"><div class="apsc-label">Départ</div><div class="apsc-val">12 août · 06:30</div></div><div class="apsc-card"><div class="apsc-label">Retour</div><div class="apsc-val">20 août · 22:10</div></div></div>' +
          '<div class="apsc-card apsc-cal"><div class="apsc-cal__head">Août 2026 <span>‹ ›</span></div><div class="apsc-cal__grid">' + apscCalendar() + '</div></div>' +
          '<span class="apsc-chip is-on apsc-days">8 jours · ALTERECO</span><div class="apsc-btn">Continuer</div></div>' +
        '<div class="apsc-pane"><div class="apsc-car">' + APSC_ICO.car + '<div><div class="apsc-label">Votre véhicule</div><div class="apsc-val">Citadine</div></div></div>' +
          '<div class="apsc-field is-focus"><div class="apsc-label">Immatriculation</div><div class="apsc-plate"><span class="apsc-plate__eu">F</span><span class="apsc-plate__txt">AB-123-CD</span><span class="apsc-caret"></span></div></div>' +
          '<div class="apsc-chips"><span class="apsc-chip is-on">Citadine</span><span class="apsc-chip">SUV</span><span class="apsc-chip">Monospace</span></div>' +
          '<div class="apsc-field apsc-row"><div><div class="apsc-label">Passagers</div><div class="apsc-val">2 personnes</div></div><div class="apsc-stepper"><i>−</i><i>+</i></div></div>' +
          '<div class="apsc-note">Véhicules hors gabarit : hauteur max 2,50 m, longueur max 5,50 m.</div><div class="apsc-btn">Continuer</div></div>' +
        '<div class="apsc-pane"><div class="apsc-card apsc-lines">' +
            '<div class="apsc-row"><span>Formule</span><b>ALTERECO</b></div><div class="apsc-row"><span>Durée</span><b>8 jours</b></div><div class="apsc-row"><span>Stationnement</span><b>57,60 €</b></div>' +
            '<div class="apsc-row is-promo"><span>Points fidélité (1 200)</span><b>− 12,00 €</b></div><hr><div class="apsc-row"><span>Total TTC</span><b class="apsc-total">45,60 €</b></div></div>' +
          '<div class="apsc-card apsc-row"><div><div class="apsc-label">Utiliser mes points</div><div class="apsc-val">1 240 disponibles</div></div><span class="apsc-toggle"></span></div>' +
          '<div class="apsc-card apsc-pay"><i></i><div><b>Visa •••• 4242</b><div class="apsc-note">Paiement sécurisé</div></div></div><div class="apsc-btn">Payer 45,60 €</div></div>' +
        '<div class="apsc-pane apsc-done"><svg class="apsc-check" viewBox="0 0 60 60" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="30" cy="30" r="25"/><path d="M19 31l7 7 15-16"/></svg>' +
          '<h4>Place réservée !</h4><p>Un e-mail de confirmation vous a été envoyé.</p>' +
          '<div class="apsc-ticket"><div><div class="apsc-label">Arrivée</div><div class="apsc-val">Mar. 12 août · 06:30</div><div class="apsc-label" style="margin-top:.5em">Parking</div><div class="apsc-val">P11 · place 42</div></div><div class="apsc-qr">' + apscQr(21, 11) + '</div></div>' +
          '<div class="apsc-btn apsc-btn--ghost" style="width:100%;margin-top:auto">Ajouter au calendrier</div></div>' +
      '</div></div></div></div>';
    var badges = p.badges === false ? '' :
      '<div class="apsc__badge apsc__badge--a"><span class="apsc__badge-ico">' + APSC_ICO.bus + '</span><span><b>Navette gratuite</b><small>Terminal en 15 min</small></span></div>' +
      '<div class="apsc__badge apsc__badge--b"><span class="apsc__badge-ico">' + APSC_ICO.gift + '</span><span><b>− 12 € fidélité</b><small>1 200 points utilisés</small></span></div>';
    return '<div class="apsc__stage"><div class="apsc__glow"></div>' + back + front + badges + '</div>';
  }
