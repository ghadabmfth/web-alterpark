import type { StaticImageData } from "next/image";

/** Lien d'action (`Href` dans index.d.ts). */
export interface Href {
  label: string;
  href?: string;
  onClick?: () => void;
}

/**
 * Image servie par next/image : chemin (public/ ou médiathèque WordPress autorisée dans next.config.ts)
 * ou import statique. Remplace les URL `AlterPark.assets` du bundle, qui ne sont pas versionnées.
 */
export type ImageSource = string | StaticImageData;
