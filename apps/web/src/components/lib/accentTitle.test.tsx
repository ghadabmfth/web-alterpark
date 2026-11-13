import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { accentTitle, plainText } from "./accentTitle";

const html = (t: string) => renderToStaticMarkup(<h2>{accentTitle(t)}</h2>);

describe("accentTitle", () => {
  it("met chiffres et ponctuation en orange (ap-accent)", () => {
    expect(html("Que de changements chez ALTERPARK depuis le 20 mars !")).toBe(
      '<h2>Que de changements chez ALTERPARK depuis le <span class="ap-accent">20</span> mars <span class="ap-accent">!</span></h2>',
    );
  });

  it("garde les nombres groupés d'un bloc (1 200, 0,50)", () => {
    expect(html("1 200 points, 0,50 €")).toBe(
      '<h2><span class="ap-accent">1 200</span> points<span class="ap-accent">,</span> <span class="ap-accent">0,50</span> €</h2>',
    );
  });

  it("met en orange les mots entre crochets", () => {
    expect(html("Votre parking [couvert] ?")).toBe('<h2>Votre parking <span class="ap-accent">couvert</span> <span class="ap-accent">?</span></h2>');
  });

  it("gère guillemets, deux-points et parenthèses", () => {
    expect(html("« Navette » : (gratuite)")).toBe(
      '<h2><span class="ap-accent">«</span> Navette <span class="ap-accent">»</span> <span class="ap-accent">:</span> <span class="ap-accent">(</span>gratuite<span class="ap-accent">)</span></h2>',
    );
  });

  it("laisse un texte sans accent intact et un nœud React tel quel", () => {
    expect(html("Réservez votre place")).toBe("<h2>Réservez votre place</h2>");
    const node = <em>déjà formaté</em>;
    expect(accentTitle(node)).toBe(node);
  });

  it("conserve le texte (plainText)", () => {
    expect(plainText(accentTitle("Le 20 mars !"))).toBe("Le 20 mars !");
  });
});
