import type { Metadata } from "next";
import LegalPage from "../components/legal/LegalPage";
import { PRIVACY_POLICY } from "../lib/legal";

export const metadata: Metadata = {
  title: "Privacy Policy | Solarium",
  description:
    "What information Solarium collects through this website, why, who sees it and what you can ask us to do with it, and how Solarium's staff sign in with Google.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage document={PRIVACY_POLICY} />;
}
