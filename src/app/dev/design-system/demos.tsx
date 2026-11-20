"use client";

import { useState } from "react";
import { Button } from "@/components/ui/actions/Button";
import { IconButton } from "@/components/ui/actions/IconButton";
import { Modal } from "@/components/ui/feedback/Modal";
import { VideoModal } from "@/components/ui/feedback/VideoModal";
import { ConfirmDialog } from "@/components/ui/feedback/ConfirmDialog";
import { ToastProvider, useToast } from "@/components/ui/feedback/Toast";
import { TextField } from "@/components/ui/forms/TextField";
import { RadioGroup } from "@/components/ui/forms/RadioGroup";
import { BookingBar, type BookingOffer } from "@/components/ui/patterns/BookingBar";

/* Interactive demos of the gallery (development only). Sample data is labelled as such. */

export function ModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Ouvrir la fenêtre</Button>
      <Modal
        open={open}
        title="Modifier mon véhicule"
        onClose={() => setOpen(false)}
        footer={
          <>
            <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>Annuler</Button>
            <Button size="sm" onClick={() => setOpen(false)}>Enregistrer</Button>
          </>
        }
      >
        <TextField label="Immatriculation" defaultValue="AB-123-CD" required />
      </Modal>
    </>
  );
}

export function ConfirmDemo() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>Annuler une réservation</Button>
      <ConfirmDialog
        open={open}
        title="Annuler la réservation AP-NTE-7K3Q9M ?"
        confirmLabel="Annuler et rembourser 45,00 €"
        cancelLabel="Conserver"
        pending={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setPending(true);
          setTimeout(() => {
            setPending(false);
            setOpen(false);
          }, 1200);
        }}
      >
        <p className="m-0">Le remboursement intégral sera émis sur le moyen de paiement d’origine. Cette action est définitive.</p>
      </ConfirmDialog>
    </>
  );
}

export function VideoDemo() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton variant="play" label="Lire la vidéo de présentation" onClick={() => setOpen(true)} />
      <VideoModal open={open} video="dQw4w9WgXcQ" title="ALTERPARK en vidéo" embed={false} onClose={() => setOpen(false)} />
    </>
  );
}

function ToastButtons() {
  const toast = useToast();
  return (
    <div className="flex flex-wrap gap-3">
      <Button size="sm" onClick={() => toast({ tone: "success", message: "Votre profil a été enregistré." })}>Succès</Button>
      <Button size="sm" variant="secondary" onClick={() => toast({ tone: "error", title: "Paiement refusé", message: "Votre banque a refusé la transaction. Aucun montant n’a été débité." })}>
        Erreur
      </Button>
    </div>
  );
}

export function ToastDemo() {
  return (
    <ToastProvider>
      <ToastButtons />
    </ToastProvider>
  );
}

export function RadioDemo() {
  const [value, setValue] = useState("alterpark");
  return (
    <RadioGroup
      legend="Service"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      options={[
        { value: "alterpark", label: "ALTERPARK — avec navette" },
        { value: "altereco", label: "ALTERECO — 15 min à pied" },
        { value: "vip", label: "Voiturier (bientôt)", disabled: true },
      ]}
    />
  );
}

/** SAMPLE DATA — gallery only. Real offers and prices come from the database (Phase 5). */
const SAMPLE_OFFERS: BookingOffer[] = [
  { id: "alterpark", name: "Parking ALTERPARK", short: "ALTERPARK", tagline: "Avec navette", badge: "Le plus demandé !", highlight: true, from: 45, features: ["Avec service navette", "Dépose au pied du terminal", "Accès espace convivialité"] },
  { id: "altereco", name: "Parking ALTERECO", short: "ALTERECO", tagline: "Sans navette · 15 min à pied", from: 35, features: ["Sans navette (15 minutes à pied)", "Parking couvert et sécurisé", "Accès espace convivialité"] },
];

export function BookingBarDemo() {
  return (
    <BookingBar
      offers={SAMPLE_OFFERS}
      perks={[
        { icon: "card", text: <>Paiement <b>sécurisé</b> en ligne</> },
        { icon: "shield", text: <>Aucun <b>coût caché</b></> },
        { icon: "h24", text: "Parking 7j/7 – 24h/24" },
      ]}
      pricing={(o, days) => (o.from ?? 0) + Math.max(0, days - 1) * 5}
      continueHref="#booking"
    />
  );
}
