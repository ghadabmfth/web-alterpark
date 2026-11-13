import Image from "next/image";
import type { ImageSource } from "./types";

interface ApImageProps {
  src: ImageSource;
  alt: string;
  className?: string;
  /** L'image remplit son parent (positionné) : photos de fond, avatars. */
  fill?: boolean;
  sizes?: string;
  priority?: boolean;
}

/**
 * Image des composants, via next/image. Le bundle utilisait <img loading="lazy"> : next/image
 * charge aussi en différé par défaut. Une URL sans dimensions connues est rendue avec
 * width/height à 0 : la taille vient alors du CSS du composant (comme dans le bundle).
 */
export function ApImage({ src, alt, className, fill, sizes, priority }: ApImageProps) {
  // Les SVG ne passent pas par l'optimiseur d'images (servis tels quels).
  const unoptimized = typeof src === "string" && /\.svg(\?|$)/i.test(src);
  if (fill) {
    return <Image src={src} alt={alt} className={className} fill sizes={sizes ?? "100vw"} priority={priority} unoptimized={unoptimized} />;
  }
  if (typeof src === "string") {
    return <Image src={src} alt={alt} className={className} width={0} height={0} sizes={sizes ?? "100vw"} priority={priority} unoptimized={unoptimized} />;
  }
  return <Image src={src} alt={alt} className={className} sizes={sizes} priority={priority} />;
}
