"use client";

import type { PointerEvent, ReactNode } from "react";
import styles from "./SpotlightCard.module.css";

type Props = {
  children: ReactNode;
  /** Elemento que envuelve el contenido; así la tarjeta no agrega un nivel extra al HTML. */
  as?: "div" | "article" | "li";
  className?: string;
};

/**
 * * Brillo con el color de acento que sigue al mouse en el borde y el fondo de la tarjeta.
 * * Solo actualiza variables CSS (sin re-render); en táctil y con movimiento reducido no se ve.
 */
export function SpotlightCard({ children, as: Tag = "div", className }: Props) {
  function handlePointerMove(event: PointerEvent<HTMLElement>) {
    if (event.pointerType !== "mouse") return;
    const card = event.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <Tag
      data-spotlight=""
      className={className ? `${styles.card} ${className}` : styles.card}
      onPointerMove={handlePointerMove}
    >
      {children}
    </Tag>
  );
}
