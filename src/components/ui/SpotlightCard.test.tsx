import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpotlightCard } from "./SpotlightCard";

function renderCard() {
  render(
    <SpotlightCard as="article">
      <h3>Contenido</h3>
    </SpotlightCard>,
  );
  return screen.getByRole("article");
}

describe("SpotlightCard", () => {
  it("renderiza el contenido con el elemento pedido", () => {
    const card = renderCard();
    expect(card).toHaveAttribute("data-spotlight");
    expect(screen.getByRole("heading", { name: "Contenido" })).toBeInTheDocument();
  });

  it("sigue la posición del mouse con variables CSS", () => {
    const card = renderCard();
    fireEvent.pointerMove(card, { pointerType: "mouse", clientX: 40, clientY: 25 });
    expect(card.style.getPropertyValue("--spotlight-x")).toBe("40px");
    expect(card.style.getPropertyValue("--spotlight-y")).toBe("25px");
  });

  it("ignora el toque en pantallas táctiles", () => {
    const card = renderCard();
    fireEvent.pointerMove(card, { pointerType: "touch", clientX: 40, clientY: 25 });
    expect(card.style.getPropertyValue("--spotlight-x")).toBe("");
  });
});
