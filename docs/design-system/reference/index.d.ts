import type * as React from 'react';

type Href = { label: string; href?: string; onClick?: () => void };

/* Actions */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary (observé) · secondary · outline · ghost (proposés) */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  /** md = 64 px (observé) · sm = 48 px (proposé, mobile et barres d'action) */
  size?: 'md' | 'sm';
  /** Rend un <a> au lieu d'un <button>. */
  href?: string;
  fullWidth?: boolean;
  iconStart?: React.ReactNode;
  iconEnd?: React.ReactNode;
  /** Force un état pour la documentation uniquement. */
  state?: 'hover' | 'focus' | 'active';
}
export declare function Button(props: ButtonProps): React.ReactElement;

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** plain : flèche orange 27 px (carrousel) · play : disque orange 89 px */
  variant?: 'plain' | 'play';
  /** 'arrowLeft' | 'arrowRight' ou un nœud SVG ; pour play, l'URL d'une image */
  icon?: 'arrowLeft' | 'arrowRight' | React.ReactNode | string;
  /** Nom accessible, obligatoire. */
  label: string;
  state?: 'hover' | 'focus' | 'active';
}
export declare function IconButton(props: IconButtonProps): React.ReactElement;

/* Navigation */
export interface NavLink { label: string; href?: string; active?: boolean; children?: { label: string; href?: string }[] }
export interface HeaderProps { links: NavLink[]; logoSrc?: string; homeHref?: string; cta?: Href; defaultOpen?: boolean; /** contenu affiché au survol du logo (ex. RatingBadge size="mini") */ logoBadge?: React.ReactNode; /** se fixe en haut, compact, après défilement */ sticky?: boolean; stickyOffset?: number; className?: string }
export declare function Header(props: HeaderProps): React.ReactElement;

export interface BreadcrumbsProps { items: { label: string; href?: string }[]; className?: string }
export declare function Breadcrumbs(props: BreadcrumbsProps): React.ReactElement;

export interface SocialRailItem { label: string; href: string; icon: string; tone?: 'dark' | 'primary' | 'light' }
export interface SocialRailProps { items?: SocialRailItem[]; /** fixé au bord droit de la fenêtre (défaut true) */ fixed?: boolean; className?: string }
export declare function SocialRail(props: SocialRailProps): React.ReactElement;

export interface FooterProps { year?: number; logoSrc?: string; homeHref?: string; legalLinks?: { label: string; href: string }[]; address?: string[]; phone?: string; email?: string; /** liens sociaux affichés sous 1024 px */ social?: SocialRailItem[]; className?: string }
export declare function Footer(props: FooterProps): React.ReactElement;

/* Contenu */
export interface HeroStep { icon: string; title: string; text?: string }
export interface HeroProps { title: string; /** effet machine à écrire (défaut true) */ typing?: boolean; intro?: string; image?: string; steps?: HeroStep[]; cta?: Href; /** barre de réservation sous l'introduction */ booking?: React.ReactNode; id?: string; children?: React.ReactNode; className?: string }
export declare function Hero(props: HeroProps): React.ReactElement;

export interface SectionHeadingProps { title: React.ReactNode; /** effet machine à écrire (défaut true) */ typing?: boolean; subtitle?: string; /** surtitre en pastille orange */ eyebrow?: string; align?: 'left' | 'center'; as?: 'h1' | 'h2' | 'h3'; size?: 'display' | 'h2'; children?: React.ReactNode; className?: string }
export declare function SectionHeading(props: SectionHeadingProps): React.ReactElement;

export interface StepsProps { items: HeroStep[]; /** hero : 4 étapes, légende Nunito · loyalty : 3 étapes, texte Montserrat */ variant?: 'hero' | 'loyalty'; titleAs?: 'h2' | 'h3' | 'h4'; className?: string }
export declare function Steps(props: StepsProps): React.ReactElement;

export interface MediaSectionProps { title: React.ReactNode; subtitle?: string; eyebrow?: string; media: React.ReactNode; /** contenu sous le texte (liste d'atouts, badges) */ after?: React.ReactNode; cta?: Href; reverse?: boolean; as?: 'h2' | 'h3'; children?: React.ReactNode; className?: string }
export declare function MediaSection(props: MediaSectionProps): React.ReactElement;

export interface BannerProps { title: React.ReactNode; image?: string; logo?: string; logoAlt?: string; cta?: Href; as?: 'h2' | 'h3'; children?: React.ReactNode; className?: string }
export declare function Banner(props: BannerProps): React.ReactElement;

export interface StarsProps { value?: number; max?: number; size?: 'sm' | 'md'; className?: string }
export declare function Stars(props: StarsProps): React.ReactElement;

export interface RatingBadgeProps { count: number; rating?: number; label?: string; source?: string; sourceLogo?: string; /** rend la carte cliquable (lien vers les avis) */ href?: string; /** mini : bulle compacte, pointe en haut (info-bulle) */ size?: 'mini'; className?: string }
export declare function RatingBadge(props: RatingBadgeProps): React.ReactElement;

export interface ReviewCardProps { name: string; text: string; rating?: number; /** date affichée, ex. « il y a 2 semaines » */ date?: string; avatar?: string; href?: string; source?: string; sourceLogo?: string; className?: string }
export declare function ReviewCard(props: ReviewCardProps): React.ReactElement;

export interface ReviewCarouselProps { items: ReviewCardProps[]; label?: string; /** défilement automatique (défaut true) */ autoplay?: boolean; /** ms entre deux avis (défaut 6000) */ interval?: number; className?: string }
export declare function ReviewCarousel(props: ReviewCarouselProps): React.ReactElement;

export interface StoreBadgesProps { googlePlayHref?: string; appStoreHref?: string; className?: string }
export declare function StoreBadges(props: StoreBadgesProps): React.ReactElement;

export interface AccordionProps { items: { title: string; content: React.ReactNode }[]; multiple?: boolean; defaultOpen?: number | number[]; headingAs?: 'h2' | 'h3' | 'h4'; className?: string }
export declare function Accordion(props: AccordionProps): React.ReactElement;

/* Formulaires */
interface FieldBase { label: string; help?: string; error?: string; success?: string; className?: string }
export interface TextFieldProps extends FieldBase, Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date';
  /** Rend un <textarea>. */
  multiline?: boolean;
  state?: 'hover' | 'focus';
}
export declare function TextField(props: TextFieldProps): React.ReactElement;
export interface SelectProps extends FieldBase, React.SelectHTMLAttributes<HTMLSelectElement> { options: (string | { value: string; label: string })[]; placeholder?: string }
export declare function Select(props: SelectProps): React.ReactElement;
export interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> { label: React.ReactNode; invalid?: boolean }
export declare function Checkbox(props: CheckboxProps): React.ReactElement;
export interface RadioGroupProps { legend: string; name?: string; options: (string | { value: string; label: string; disabled?: boolean })[]; value?: string; defaultValue?: string; onChange?: React.ChangeEventHandler<HTMLInputElement>; className?: string }
export declare function RadioGroup(props: RadioGroupProps): React.ReactElement;
export interface ToggleProps extends React.InputHTMLAttributes<HTMLInputElement> { label: React.ReactNode }
export declare function Toggle(props: ToggleProps): React.ReactElement;

/* Feedback */
export interface AlertProps { tone?: 'success' | 'warning' | 'error' | 'info'; title?: string; dismissible?: boolean; onDismiss?: () => void; children?: React.ReactNode; className?: string }
export declare function Alert(props: AlertProps): React.ReactElement | null;
export interface ModalProps { open: boolean; title: string; onClose?: () => void; footer?: React.ReactNode; /** affichage dans le flux (documentation) */ inline?: boolean; children?: React.ReactNode; className?: string }
export declare function Modal(props: ModalProps): React.ReactElement | null;

/* Patterns */
export interface AppShowcaseProps { /** prénom affiché (exemple) */ firstName?: string; /** pastilles flottantes (défaut true) */ badges?: boolean; label?: string; className?: string }
export declare function AppShowcase(props: AppShowcaseProps): React.ReactElement;

export interface FeatureListProps { items: { icon?: 'bolt' | 'ticket' | 'gift' | 'pin' | 'shield' | 'bus'; title: string; text?: string }[]; columns?: 1 | 2; className?: string }
export declare function FeatureList(props: FeatureListProps): React.ReactElement;

export interface BookingOffer { id: string; name: string; short?: string; tagline?: string; /** prix de départ TTC */ from?: number; badge?: string; highlight?: boolean; features: string[] }
export interface BookingDates { date: string; time: string }
export interface BookingBarProps { offers?: BookingOffer[]; pricing?: (offer: BookingOffer, days: number, search: { dep: BookingDates; ret: BookingDates; days: number }) => number | null; perks?: { icon: 'card' | 'shield' | 'h24'; text: React.ReactNode }[]; onSearch?: (s: { departure: BookingDates; return: BookingDates; days: number }) => void; onSelect?: (s: { offer: BookingOffer; price: number | null; departure: BookingDates; return: BookingDates; days: number }) => void; continueHref?: string; submitLabel?: string; /** parking présélectionné */ defaultService?: string; className?: string }
export declare function BookingBar(props: BookingBarProps): React.ReactElement;

export interface VideoModalProps { open: boolean; /** lien ou identifiant YouTube */ video: string; title?: string; onClose?: () => void; /** force l'intégration (défaut : auto, désactivée dans les aperçus sécurisés) */ embed?: boolean }
export declare function VideoModal(props: VideoModalProps): React.ReactElement | null;

export type ServiceIcon = 'evCharger' | 'seatSpray' | 'carWash' | 'carDoc' | 'thumbStars' | 'stopwatch' | 'medal' | 'plantHand';
export interface ServiceCardProps { id?: string; icon: ServiceIcon; title: string; titleAs?: 'h2' | 'h3'; /** nombre → « 49,00 € TTC » ; texte → pastille (ex. « Devis gratuit ») */ price?: number | string; priceNote?: string; badge?: string; /** contour orange (offre mise en avant) */ featured?: boolean; tagline?: string; intro?: string; items?: { title: string; text?: string; lines?: { label: string; text: string }[] }[]; notes?: string[]; cta?: Href; className?: string }
export declare function ServiceCard(props: ServiceCardProps): React.ReactElement;
export interface HighlightsProps { items: { icon: ServiceIcon; title: string; text: string }[]; titleAs?: 'h2' | 'h3'; className?: string }
export declare function Highlights(props: HighlightsProps): React.ReactElement;

declare global {
  interface Window {
    AlterPark: {
      Button: typeof Button; IconButton: typeof IconButton; Header: typeof Header; Breadcrumbs: typeof Breadcrumbs; SocialRail: typeof SocialRail; Footer: typeof Footer;
      Hero: typeof Hero; SectionHeading: typeof SectionHeading; Steps: typeof Steps; MediaSection: typeof MediaSection; Banner: typeof Banner;
      RatingBadge: typeof RatingBadge; Stars: typeof Stars; ReviewCard: typeof ReviewCard; ReviewCarousel: typeof ReviewCarousel; StoreBadges: typeof StoreBadges; Accordion: typeof Accordion;
      TextField: typeof TextField; Select: typeof Select; Checkbox: typeof Checkbox; RadioGroup: typeof RadioGroup; Toggle: typeof Toggle; Alert: typeof Alert; Modal: typeof Modal; AppShowcase: typeof AppShowcase; FeatureList: typeof FeatureList; BookingBar: typeof BookingBar; VideoModal: typeof VideoModal; ServiceCard: typeof ServiceCard; Highlights: typeof Highlights;
      /** URLs des fichiers du système (logo, pictogrammes, photos). */
      assets: Record<string, string>;
    };
  }
}
