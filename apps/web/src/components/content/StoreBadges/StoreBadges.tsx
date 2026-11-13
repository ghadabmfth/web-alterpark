import { cx } from "../../lib/cx";
import { ApImage } from "../../lib/ApImage";
import type { ImageSource } from "../../lib/types";

export interface StoreBadgesProps {
  googlePlayHref?: string;
  appStoreHref?: string;
  /** Badge officiel Google Play (fichier fourni par Google, non versionné dans le design system). */
  googlePlayBadge?: ImageSource;
  /** Badge officiel App Store (fichier fourni par Apple, non versionné dans le design system). */
  appStoreBadge?: ImageSource;
  className?: string;
}

/** Badges officiels Google Play et App Store. Un badge n'est affiché qu'avec son lien et son image. */
export function StoreBadges({ googlePlayHref, appStoreHref, googlePlayBadge, appStoreBadge, className }: StoreBadgesProps) {
  return (
    <div className={cx("ap-root ap-stores", className)}>
      {googlePlayHref && googlePlayBadge ? (
        <a href={googlePlayHref}>
          <ApImage src={googlePlayBadge} alt="Disponible sur Google Play" sizes="223px" />
        </a>
      ) : null}
      {appStoreHref && appStoreBadge ? (
        <a href={appStoreHref}>
          <ApImage src={appStoreBadge} alt="Disponible sur l’App Store" sizes="223px" />
        </a>
      ) : null}
    </div>
  );
}
