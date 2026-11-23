"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cx } from "../lib/cx";
import { useReducedMotion } from "../lib/motion";
import { ArrowLeftIcon, ArrowRightIcon } from "../icons/icons";
import { ReviewCard, type ReviewCardProps } from "./ReviewCard";

/*
 * ReviewCarousel — design system "Content". Touch scrolling with snap, round arrows, pagination
 * dots, autoplay paused on hover, focus, touch, hidden tab and reduced motion. Arrow keys on the
 * focused track move by one review.
 */
export interface ReviewCarouselProps {
  items: ReviewCardProps[];
  label?: string;
  autoplay?: boolean;
  /** ms between two reviews (default 6000). */
  interval?: number;
  className?: string;
}

export function ReviewCarousel({ items, label = "Avis clients", autoplay = true, interval = 6000, className }: ReviewCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [pages, setPages] = useState(1);
  const hold = useRef(false);
  const reduced = useReducedMotion();

  const perView = useCallback(() => {
    const t = ref.current;
    const first = t?.firstElementChild;
    if (!t || !first) return 1;
    return Math.max(1, Math.round(t.clientWidth / first.getBoundingClientRect().width));
  }, []);

  const goTo = useCallback(
    (i: number) => {
      const t = ref.current;
      if (!t) return;
      const card = t.children[Math.max(0, Math.min(items.length - 1, i))] as HTMLElement | undefined;
      if (card) t.scrollTo({ left: card.offsetLeft - t.offsetLeft - parseFloat(getComputedStyle(t).paddingLeft || "0") });
    },
    [items.length],
  );

  const step = useCallback(
    (dir: 1 | -1) => {
      const last = items.length - perView();
      let next = active + dir;
      if (next > last) next = 0;
      if (next < 0) next = last;
      goTo(next);
    },
    [active, goTo, items.length, perView],
  );

  useEffect(() => {
    const t = ref.current;
    if (!t) return;
    const onScroll = () => {
      const c = t.firstElementChild;
      if (!c) return;
      const w = c.getBoundingClientRect().width + parseFloat(getComputedStyle(t).columnGap || "0");
      setActive(Math.round(t.scrollLeft / w));
    };
    const onResize = () => setPages(Math.max(1, items.length - perView() + 1));
    const raf = requestAnimationFrame(onResize);
    t.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    return () => {
      cancelAnimationFrame(raf);
      t.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [items.length, perView]);

  useEffect(() => {
    if (!autoplay || reduced) return;
    const id = setInterval(() => {
      if (!hold.current && !document.hidden) step(1);
    }, interval);
    return () => clearInterval(id);
  }, [autoplay, reduced, interval, step]);

  const holdOn = () => {
    hold.current = true;
  };
  const holdOff = () => {
    hold.current = false;
  };

  return (
    <div
      className={cx("ap-root ap-carousel", className)}
      role="region"
      aria-roledescription="carrousel"
      aria-label={label}
      onMouseEnter={holdOn}
      onMouseLeave={holdOff}
      onFocus={holdOn}
      onBlur={holdOff}
      onTouchStart={holdOn}
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
