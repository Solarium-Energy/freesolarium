import type { Metadata } from "next";
import LegalPage from "../components/legal/LegalPage";
import { TERMS_OF_SERVICE } from "../lib/legal";

export const metadata: Metadata = {
  title: "Terms of Service | Solarium",
  description: "The terms that apply when you use the Solarium website, its quotation and its booking form.",
  alternates: { canonical: "/terms" },
  openGraph: {
    // A page's openGraph replaces the layout's, so the rest of it is repeated here.
    title: "Terms of Service | Solarium",
    description:
      "The terms that apply when you use the Solarium website, its quotation and its booking form.",
    type: "website",
    locale: "en_IN",
    siteName: "Solarium Green Energy",
    images: [{ url: "/images/home-solar.png", width: 1024, height: 1024 }],
  },
};

export default function TermsPage() {
  return <LegalPage document={TERMS_OF_SERVICE} />;
}
