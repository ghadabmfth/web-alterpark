"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "../../lib/cx";
import { prefersReducedMotion } from "../../lib/hooks";
import { ArrowLeftIcon, ArrowRightIcon } from "../../icons/ui";
import { ReviewCard, type ReviewCardProps } from "../ReviewCard/ReviewCard";

export interface ReviewCarouselProps {
  items: ReviewCardProps[];
  label?: string;
  /** défilement automatique (défaut true) */
  autoplay?: boolean;
  /** ms entre deux avis (défaut 6000) */
  interval?: number;
  className?: string;
}

/* Carrousel d'avis : défilement tactile avec accrochage, flèches, points de pagination,
   défilement automatique (pause au survol, au focus et si l'utilisateur réduit les animations). */
export function ReviewCarousel({ items, label, autoplay, interval, className }: ReviewCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pages, setPages] = useState(1);
  const hold = useRef(false);

  const perView = () => {
    const t = ref.current;
    const first = t?.firstElementChild;
    if (!t || !first) return 1;
    return Math.max(1, Math.round(t.clientWidth / first.getBoundingClientRect().width));
  };
  const goTo = (i: number) => {
    const t = ref.current;
    if (!t) return;
    const card = t.children[Math.max(0, Math.min(items.length - 1, i))] as HTMLElement | undefined;
    if (card) t.scrollTo({ left: card.offsetLeft - t.offsetLeft - parseFloat(getComputedStyle(t).paddingLeft || "0") });
  };
  const step = (dir: number) => {
    const n = items.length - perView();
    let next = active + dir;
    if (next > n) next = 0;
    if (next < 0) next = n;
    goTo(next);
  };
  const stepRef = useRef(step);
  useEffect(() => {
    stepRef.current = step;
  });

  useEffect(() => {
    const t = ref.current;
    if (!t) return;
    const onScroll = () => {
      const c = t.firstElementChild;
      if (!c) return;
      const w = c.getBoundingClientRect().width + parseFloat(getComputedStyle(t).columnGap || "0");
      setActive(Math.round(t.scrollLeft / w));
    };
    const onResize = () => {
      const first = t.firstElementChild;
      const pv = first ? Math.max(1, Math.round(t.clientWidth / first.getBoundingClientRect().width)) : 1;
      setPages(Math.max(1, items.length - pv + 1));
    };
    const raf = requestAnimationFrame(onResize);
    t.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length]);

  useEffect(() => {
    if (autoplay === false || prefersReducedMotion()) return;
    const id = setInterval(() => {
      if (!hold.current && !document.hidden) stepRef.current(1);
    }, interval || 6000);
    return () => clearInterval(id);
  }, [autoplay, interval]);

  return (
    <div
      className={cx("ap-root ap-carousel", className)}
      role="region"
      aria-roledescription="carrousel"
      aria-label={label || "Avis clients"}
      onMouseEnter={() => {
        hold.current = true;
      }}
      onMouseLeave={() => {
        hold.current = false;
      }}
      onFocus={() => {
        hold.current = true;
      }}
      onBlur={() => {
        hold.current = false;
      }}
      onTouchStart={() => {
        hold.current = true;
      }}
    >
      <div
        className="ap-carousel__track"
        ref={ref}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            step(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            step(-1);
          }
        }}
      >
        {items.map((it, i) => (
          <ReviewCard key={i} {...it} />
        ))}
      </div>
      <div className="ap-carousel__nav">
        <button type="button" className="ap-carousel__arrow" aria-label="Avis précédent" onClick={() => step(-1)}>
          <ArrowLeftIcon />
        </button>
        <div className="ap-carousel__dots">
          {Array.from({ length: pages }, (_, d) => (
            <button
              key={d}
              type="button"
              className={cx("ap-carousel__dot", d === Math.min(active, pages - 1) && "is-on")}
              aria-label={`Aller à l’avis ${d + 1}`}
              aria-current={d === active ? "true" : undefined}
              onClick={() => goTo(d)}
            />
          ))}
        </div>
        <button type="button" className="ap-carousel__arrow" aria-label="Avis suivant" onClick={() => step(1)}>
          <ArrowRightIcon />
        </button>
      </div>
    </div>
  );
}
