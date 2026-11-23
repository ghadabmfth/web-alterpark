export interface NavLink {
  label: string;
  href?: string;
  active?: boolean;
  children?: { label: string; href?: string }[];
}

export interface LinkAction {
  label: string;
  href?: string;
  onClick?: () => void;
}

export interface SocialItem {
  label: string;
  href: string;
  /** System pictogram name ("facebook", "login", "youtube", "facebookGlyph", "youtubeGlyph") or image URL. */
  icon: string;
  tone?: "dark" | "primary" | "light";
}
