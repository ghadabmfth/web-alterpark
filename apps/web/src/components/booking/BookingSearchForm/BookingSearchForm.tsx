"use client";

/* Proposé : étape « recherche » (parking, départ, retour), construite sur Select, DateTimeRange et Button. */
import { useState, type FormEvent } from "react";
import { cx } from "../../lib/cx";
import { Select } from "../../forms/Select/Select";
import { Button } from "../../actions/Button/Button";
import { DateTimeRange, EMPTY_STAY, useStayValidation, type StayValue } from "../DateTimeField/DateTimeField";
import { DEFAULT_TIME_ZONE } from "@/lib/booking/datetime";

export interface SearchParking {
  id: string;
  name: string;
  /** `min_lead_minutes` du parking. */
  minLeadMinutes: number;
  /** `timezone` du parking. */
  timeZone?: string;
}

export interface BookingSearchFormProps {
  /** Parkings publiés (apbs/v1/parkings). */
  parkings: SearchParking[];
  defaultParkingId?: string;
  defaultValue?: StayValue;
  onSearch?: (s: { parkingId: string } & StayValue) => void;
  /** Recherche en cours : bouton désactivé, libellé d'attente. */
  pending?: boolean;
  className?: string;
}

/**
 * Formulaire de recherche du tunnel : parking puis dates. BookingBar reste la barre d'accueil ;
 * ce formulaire couvre l'étape 1 quand le parking n'est pas encore choisi.
 */
export function BookingSearchForm({ parkings, defaultParkingId, defaultValue, onSearch, pending, className }: BookingSearchFormProps) {
  const [parkingId, setParkingId] = useState(defaultParkingId ?? (parkings.length === 1 ? parkings[0]!.id : ""));
  const [parkingError, setParkingError] = useState("");
  const [stay, setStay] = useState<StayValue>(defaultValue ?? EMPTY_STAY);
  const parking = parkings.find((p) => p.id === parkingId);
  const v = useStayValidation({ minLeadMinutes: parking?.minLeadMinutes ?? 0, timeZone: parking?.timeZone });

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const pErr = parkingId ? "" : "Choisissez un parking.";
    setParkingError(pErr);
    const ok = v.validateAll(stay);
    if (pErr || !ok) {
      // Le focus va au premier champ en erreur.
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    onSearch?.({ parkingId, ...stay });
  };

  return (
    <form className={cx("ap-root ap-search", className)} onSubmit={submit} noValidate aria-label="Rechercher une place">
      <Select
        label="Parking"
        name="parking"
        required
        placeholder="Choisissez un parking"
        options={parkings.map((p) => ({ value: p.id, label: p.name }))}
        value={parkingId}
        error={parkingError}
        onChange={(e) => {
          setParkingId(e.target.value);
          if (e.target.value) setParkingError("");
        }}
      />
      <DateTimeRange
        value={stay}
        timeZone={parking?.timeZone ?? DEFAULT_TIME_ZONE}
        errors={v.errors}
        onChange={(s) => {
          setStay(s);
          v.update(s);
        }}
        onFieldBlur={(f) => v.touch(f, stay)}
      />
      <Button type="submit" disabled={pending} className="ap-search__submit">
        {pending ? "Recherche en cours…" : "Voir les disponibilités"}
      </Button>
    </form>
  );
}
