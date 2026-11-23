"use client";

import { useState } from "react";
import Image from "next/image";
import { IconButton } from "@/components/ui/actions/IconButton";
import { RatingBadge } from "@/components/ui/content/RatingBadge";
import { VideoModal } from "@/components/ui/feedback/VideoModal";
import { assets } from "@/components/ui/lib/assets";
import { googleRating, presentationVideo } from "@/config/site";

/* « Que de changements » collage of the client's design: Google badge, two photos, video button. */
export function VideoCollage() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="collage">
        <div className="collage__col collage__col--a">
          <div className="collage__badge">
            <RatingBadge count={googleRating.count} rating={googleRating.rating} />
          </div>
          <Image className="collage__a" src={assets.ombrieresPhoto.src} width={397} height={539} sizes="(min-width: 1024px) 400px, 45vw" alt="Parking ALTERPARK sous ombrières photovoltaïques" />
        </div>
        <div className="collage__col collage__col--b">
          <Image className="collage__b" src={assets.entreePhoto.src} width={395} height={535} sizes="(min-width: 1024px) 400px, 90vw" alt="Entrée du parking ALTERPARK P11 au lever du jour" />
          <IconButton variant="play" label="Lire la vidéo de présentation du parking" onClick={() => setOpen(true)} />
        </div>
      </div>
      <VideoModal open={open} video={presentationVideo} title="Découvrez ALTERPARK" onClose={() => setOpen(false)} />
    </>
  );
}

/* « Voir la vidéo » link of the Services Plus hero. */
export function WatchVideo({ title }: { title: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" className="sp-watch" onClick={() => setOpen(true)}>
        <span className="sp-watch__ico" aria-hidden>
          <svg viewBox="0 0 52 52"><circle cx="26" cy="26" r="26" fill="currentColor" /><path d="M21 17.5v17l14-8.5z" fill="var(--surface)" /></svg>
        </span>
        Voir la vidéo
      </button>
      <VideoModal open={open} video={presentationVideo} title={title} onClose={() => setOpen(false)} />
    </>
  );
}
