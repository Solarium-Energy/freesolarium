import type { Metadata } from "next";

import ClosingCta from "./components/ClosingCta";
import ComponentExplorer from "./components/ComponentExplorer";
import FaqSection from "./components/FaqSection";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Hero, { PhoneQuotationBar } from "./components/Hero";
import LogoWall from "./components/LogoWall";
import PhoneDock from "./components/PhoneDock";
import QuotationProvider from "./components/quotation/QuotationProvider";
import Reviews from "./components/Reviews";
import RisingSteps from "./components/RisingSteps";
import SixRays from "./components/SixRays";
import StatsBand from "./components/StatsBand";
import TestModeBar from "./components/TestModeBar";
import { FAQS } from "./lib/content";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.a,
    },
  })),
};

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <QuotationProvider>
          <Hero />
          {/* Links to /#quotation land here, with the bar in view at every width. */}
          <span id="quotation" className="quote-anchor" />
          <StatsBand>
            <PhoneQuotationBar />
          </StatsBand>
        </QuotationProvider>
        <ComponentExplorer />
        <LogoWall />
        <SixRays />
        <RisingSteps />
        <Reviews />
        <FaqSection />
        <ClosingCta />
      </main>
      <Footer />
      <PhoneDock />
      <TestModeBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqStructuredData).replace(/</g, "\\u003c"),
        }}
      />
    </>
  );
}
