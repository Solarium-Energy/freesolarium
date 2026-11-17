"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "../../lib/language";
import Alert from "../ui/Alert";

/* The parts of a legal page that follow the language switch. The legal text itself is English only. */

export function LegalEyebrow() {
  const { isGu } = useLanguage();
  return <div className="eyebrow">{isGu ? "સોલેરિયમ (Solarium)" : "Solarium"}</div>;
}

/** In Gujarati, one line above the text says the document is in English. */
export function EnglishOnlyNote() {
  const { isGu } = useLanguage();
  if (!isGu) return null;
  return (
    <Alert meaning="info" className="legal-note">
      આ દસ્તાવેજ અંગ્રેજીમાં ઉપલબ્ધ છે.
    </Alert>
  );
}

export function BackHome() {
  const { isGu } = useLanguage();
  return (
    <Link href="/" className="link">
      <ArrowLeft className="ico" aria-hidden="true" />
      {isGu ? "મુખ્ય પૃષ્ઠ પર પાછા જાઓ" : "Back to home"}
    </Link>
  );
}
