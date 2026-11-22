/** Brand files of the design system, served from /public/brand. Intrinsic sizes for next/image. */
export const assets = {
  heroPhoto: { src: "/brand/photos/hero-parking-aerien.jpg", width: 1920, height: 1080 },
  entreePhoto: { src: "/brand/photos/entree-parking.jpg", width: 765, height: 1020 },
  ombrieresPhoto: { src: "/brand/photos/ombrieres-photovoltaiques.jpg", width: 1360, height: 907 },
  rallyePhoto: { src: "/brand/photos/rallye-du-coeur-bandeau.jpg", width: 1920, height: 500 },
  servicesWashPhoto: { src: "/brand/photos/services-lavage.webp", width: 2000, height: 1334 },
  servicesHeroPhoto: { src: "/brand/photos/services-recharge-aerien.webp", width: 2400, height: 1046 },
  appPhoto: { src: "/brand/photos/application-mobile.png", width: 1200, height: 1295 },
  rallyeLogo: { src: "/brand/partners/rallye-du-coeur-logo.png", width: 580, height: 110 },
  googlePlay: { src: "/brand/partners/badge-google-play.png", width: 300, height: 100 },
  appStore: { src: "/brand/partners/badge-app-store.png", width: 300, height: 100 },
  google: { src: "/brand/partners/google-g.png", width: 256, height: 256 },
} as const;

export type BrandImage = { src: string; width: number; height: number };
