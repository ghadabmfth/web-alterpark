"use client";

/* Démonstrations interactives de la galerie de développement (état local uniquement). */
import { useState } from "react";
import { Button } from "@/components/actions/Button/Button";
import { IconButton } from "@/components/actions/IconButton/IconButton";
import { Modal } from "@/components/feedback/Modal/Modal";
import { VideoModal } from "@/components/feedback/VideoModal/VideoModal";
import { RadioGroup } from "@/components/forms/RadioGroup/RadioGroup";
import { BookingBar } from "@/components/patterns/BookingBar/BookingBar";
import { OfferList } from "@/components/booking/OfferList/OfferList";
import { BookingSearchForm } from "@/components/booking/BookingSearchForm/BookingSearchForm";
import { CustomerForm } from "@/components/booking/CustomerForm/CustomerForm";
import { DateTimeField, DateTimeRange } from "@/components/booking/DateTimeField/DateTimeField";
import { barOffers, parkings, quotes } from "./fixtures";

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        Ouvrir la fenêtre
      </Button>
      <Modal
        open={open}
        title="Annuler la réservation ?"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
              Garder ma réservation
            </Button>
            <Button size="sm" onClick={() => setOpen(false)}>
              Annuler la réservation
            </Button>
          </>
        }
      >
        Le remboursement suit les conditions générales de vente.
      </Modal>
    </>
  );
}

export function VideoDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton variant="play" label="Lire la vidéo de présentation" onClick={() => setOpen(true)} />
      <VideoModal open={open} video="https://www.youtube.com/watch?v=aqz-KE-bpKQ" title="Vidéo d’exemple" embed={false} onClose={() => setOpen(false)} />
    </>
  );
}

export function RadioDemo() {
  const [value, setValue] = useState("navette");
  return (
    <RadioGroup
      legend="Service"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      options={[
        { value: "navette", label: "Avec navette" },
        { value: "eco", label: "Éco" },
        { value: "premium", label: "Premium (complet)", disabled: true },
      ]}
    />
  );
}

export function BookingBarDemo({ withOffers }: { withOffers: boolean }) {
  return (
    <BookingBar
      offers={withOffers ? barOffers : []}
      pricing={withOffers ? (o, days) => (o.from ?? 0) + Math.max(0, days - 1) * 6 : undefined}
      perks={withOffers ? [{ icon: "shield", text: "Parking sécurisé" }, { icon: "h24", text: "Accès 7j/7 – 24h/24" }] : []}
    />
  );
}

export function OfferListDemo() {
  const [selected, setSelected] = useState<string>();
  return (
    <OfferList
      offers={quotes}
      days={8}
      selectedId={selected}
      onSelect={(o) => setSelected(o.id)}
      summary={
        <>
          Du <b>ven. 20 nov. 2026 à 08:00</b> au <b>ven. 27 nov. 2026 à 18:00</b> · 8 jours
        </>
      }
    />
  );
}

export function SearchFormDemo() {
  const [last, setLast] = useState("");
  return (
    <>
      <BookingSearchForm parkings={parkings} onSearch={(s) => setLast(`${s.parkingId} : ${s.departure.date} ${s.departure.time} → ${s.return.date} ${s.return.time}`)} />
      {last ? <p className="ap-gallery__note">{`Recherche envoyée (${last})`}</p> : null}
    </>
  );
}

export function CustomerFormDemo() {
  const [sent, setSent] = useState(false);
  return (
    <>
      <CustomerForm cgvHref="#cgv" onSubmit={() => setSent(true)} />
      {sent ? <p className="ap-gallery__note">Formulaire valide : la Server Action de blocage sera branchée en phase 5.</p> : null}
    </>
  );
}

/** États d'erreur affichés, valeurs figées. */
export function DateFieldErrorsDemo() {
  return (
    <>
      <div className="ap-gallery__narrow">
        <DateTimeField
          legend="Départ"
          value={{ date: "2026-11-13", time: "11:00" }}
          onChange={() => {}}
          timeError="Réservez au moins 2 h avant votre départ : départ possible à partir du 13/11/2026 à 12:00."
        />
      </div>
      <DateTimeRange
        value={{ departure: { date: "2026-11-20", time: "08:00" }, return: { date: "2026-11-19", time: "18:00" } }}
        onChange={() => {}}
        errors={{ returnDate: "Le retour doit être après le départ." }}
      />
    </>
  );
}
