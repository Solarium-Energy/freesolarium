"use client";

import { useLanguage } from "../lib/language";
import Button from "./ui/Button";

/** "Book at ₹0*": the header's main action, also used in the phone menu. Written once, so the page keeps one sun. */
export default function BookButton({ block, onClick }: { block?: boolean; onClick?: () => void }) {
  const { isGu } = useLanguage();
  return (
    <Button variant="sun" href="/book" block={block} onClick={onClick}>
      {isGu ? "₹0* માં બુક કરો" : "Book at ₹0*"}
    </Button>
  );
}
