import Image from "next/image";
import { cx } from "../lib/cx";
import { assets } from "../lib/assets";

/** StoreBadges — design system "Content". Official Google Play and App Store badges. */
export interface StoreBadgesProps {
  googlePlayHref: string;
  appStoreHref: string;
  className?: string;
}

export function StoreBadges({ googlePlayHref, appStoreHref, className }: StoreBadgesProps) {
  return (
    <div className={cx("ap-root ap-stores", className)}>
      <a href={googlePlayHref}>
        <Image src={assets.googlePlay.src} width={assets.googlePlay.width} height={assets.googlePlay.height} alt="Disponible sur Google Play" />
      </a>
      <a href={appStoreHref}>
        <Image src={assets.appStore.src} width={assets.appStore.width} height={assets.appStore.height} alt="Disponible sur l’App Store" />
      </a>
    </div>
  );
}
