// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { DateTimeRange, EMPTY_STAY, useStayValidation, type StayValue } from "./DateTimeField";

// 13/11/2026 10:00 à Paris
const NOW = new Date(Date.UTC(2026, 10, 13, 9, 0));

function Harness({ onValid }: { onValid?: (v: StayValue) => void }) {
  const [stay, setStay] = useState<StayValue>(EMPTY_STAY);
  const v = useStayValidation({ minLeadMinutes: 120, timeZone: "Europe/Paris" });
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (v.validateAll(stay)) onValid?.(stay);
      }}
    >
      <DateTimeRange
        value={stay}
        errors={v.errors}
        onChange={(s) => {
          setStay(s);
          v.update(s);
        }}
        onFieldBlur={(f) => v.touch(f, stay)}
      />
      <button type="submit">Valider</button>
    </form>
  );
}

const fields = () => {
  const [depDate, retDate] = screen.getAllByLabelText(/^Date/) as HTMLInputElement[];
  const [depTime, retTime] = screen.getAllByLabelText(/^Heure/) as HTMLInputElement[];
  return { depDate: depDate!, depTime: depTime!, retDate: retDate!, retTime: retTime! };
};
const fill = (el: HTMLInputElement, value: string) => {
  fireEvent.change(el, { target: { value } });
  fireEvent.blur(el);
};

describe("DateTimeRange + useStayValidation", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(NOW);
  });
  afterEach(() => vi.useRealTimers());

  it("n'affiche aucune erreur avant qu'un champ soit quitté", () => {
    render(<Harness />);
    expect(screen.queryByText(/Indiquez/)).toBeNull();
  });

  it("affiche toutes les erreurs à l'envoi, sur le bon champ", () => {
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(onValid).not.toHaveBeenCalled();
    const { depDate, retTime } = fields();
    expect(depDate.getAttribute("aria-invalid")).toBe("true");
    expect(screen.getByText("Indiquez la date de départ.")).toBeTruthy();
    expect(retTime.getAttribute("aria-describedby")).toBeTruthy();
    expect(screen.getByText("Indiquez l’heure de retour.")).toBeTruthy();
  });

  it("refuse un retour avant le départ", () => {
    render(<Harness />);
    const f = fields();
    fill(f.depDate, "2026-11-20");
    fill(f.depTime, "08:00");
    fill(f.retDate, "2026-11-19");
    fill(f.retTime, "08:00");
    expect(screen.getByText("Le retour doit être après le départ.")).toBeTruthy();
  });

  it("applique le délai minimal avant départ", () => {
    render(<Harness />);
    const f = fields();
    fill(f.depDate, "2026-11-13");
    fill(f.depTime, "11:00");
    expect(screen.getByText(/Réservez au moins 2 h avant votre départ/)).toBeTruthy();
  });

  it("efface l'erreur pendant la correction et affiche la durée facturée", () => {
    const onValid = vi.fn();
    render(<Harness onValid={onValid} />);
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    const f = fields();
    fill(f.depDate, "2026-11-20");
    expect(screen.queryByText("Indiquez la date de départ.")).toBeNull();
    fill(f.depTime, "08:00");
    fill(f.retDate, "2026-11-27");
    fill(f.retTime, "18:00");
    expect(screen.getByText("8 jours")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Valider" }));
    expect(onValid).toHaveBeenCalledWith({ departure: { date: "2026-11-20", time: "08:00" }, return: { date: "2026-11-27", time: "18:00" } });
  });
});
