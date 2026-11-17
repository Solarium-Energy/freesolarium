import type { Metadata } from "next";
import LegalPage from "../components/legal/LegalPage";
import { TERMS_OF_SERVICE } from "../lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service | Solarium",
  description: "The terms that apply when you use the Solarium website, its quotation and its booking form.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage document={TERMS_OF_SERVICE} />;
}
