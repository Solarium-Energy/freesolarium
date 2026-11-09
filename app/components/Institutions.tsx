"use client";

import Image from "next/image";
import { useLanguage } from "../lib/language";
import Reveal from "./Reveal";

const CLIENT_LOGOS = [
  { src: "/clients/indian-airforce.png", alt: "Indian Air Force", scale: "scale-[1.06]" },
  { src: "/clients/indian-army.svg",     alt: "Indian Army", scale: "scale-[0.75]" },
  { src: "/clients/drdo.png",             alt: "DRDO", scale: "scale-[0.75]" },
  { src: "/clients/indian-railways.png", alt: "Indian Railways", scale: "scale-[1.06]" },
  { src: "/clients/ntpc.svg",            alt: "NTPC", scale: "scale-[0.80]" },
  { src: "/clients/lic.png",             alt: "LIC", scale: "scale-[0.82]" },
  { src: "/clients/geb.png",             alt: "Gujarat Electricity Board", scale: "scale-[0.76]" },
  { src: "/clients/bank-of-india.png",   alt: "Bank of India", scale: "scale-[0.82]" },
  { src: "/clients/itbp.png",            alt: "ITBP", scale: "scale-[1.06]" },
  { src: "/clients/hindustan-petroleum.png", alt: "Hindustan Petroleum", scale: "scale-[0.76]" },
  { src: "/clients/counter-insurgency-force.svg", alt: "Counter Insurgency Force", scale: "scale-[0.75]" },
  { src: "/clients/agl.png",             alt: "AGL", scale: "scale-[0.82]" },
  { src: "/clients/ahmedabad-university.png", alt: "Ahmedabad University", scale: "scale-[0.80]" },
  { src: "/clients/gudc.png",            alt: "Gujarat Urban Development Company", scale: "scale-[0.80]" },
  { src: "/clients/goa-shipyard.png",    alt: "Goa Shipyard", scale: "scale-[0.80]" },
  { src: "/clients/bsf.png",             alt: "Border Security Force", scale: "scale-[0.76]" },
];

export default function Institutions() {
  const { isGu } = useLanguage();
  return (
    <section id="clients" className="border-y border-line bg-white py-14 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-9 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14 lg:px-6">

        {/* ── Left: copy ── */}
        <Reveal direction="left">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange">
              {isGu ? "સંસ્થાકીય ટ્રેક રેકોર્ડ" : "Institutional track record"}
            </p>
            <h2 className="mt-4 max-w-[18ch] text-[clamp(1.75rem,3.6vw,2.5rem)] font-bold leading-[1.08] tracking-[-0.035em] text-balance">
              {isGu
                ? "ભારતના સૌથી વધુ માંગવાળા સ્થળોએ અમે જે એન્જિનિયરિંગ પહોંચાડીએ છીએ"
                : "The engineering we deliver to India's most demanding sites"}
            </h2>
            <p className="mt-4 max-w-[34rem] text-[14px] leading-relaxed text-body">
              {isGu
                ? "સોલેરિયમે સશસ્ત્ર દળો, સંશોધન સંસ્થાઓ, જાહેર ક્ષેત્રના ઉપક્રમો અને ભારતની કેટલીક મોટી બેંકો માટે સૌર પ્રોજેક્ટ્સ અમલમાં મૂક્યા છે."
                : "Solarium has executed solar projects for the armed forces, research institutions, public sector undertakings and some of India's largest banks."}
            </p>
            <p className="mt-5 inline-flex items-center gap-2 text-[13px] font-bold text-navy">
              <span className="h-1.5 w-1.5 rounded-full bg-orange" aria-hidden="true" />
              {isGu
                ? "એ જ એન્જિનિયરિંગ ધોરણો, હવે તમારા છત પર."
                : "Same engineering standards, now on your rooftop."}
            </p>
          </div>
        </Reveal>

        {/* ── Right: logo grid ── */}
        <div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {CLIENT_LOGOS.map((logo, i) => (
              <Reveal key={logo.alt} direction="scale" delay={(i % 4) * 55 + Math.floor(i / 4) * 45}>
                <div className="group flex h-18 items-center justify-center rounded-xl border border-line bg-paper/60 p-2 transition-all duration-200 hover:border-line-strong hover:bg-white hover:shadow-sm sm:h-21 sm:p-3">
                  <div className="relative flex h-full w-full items-center justify-center scale-105 sm:scale-100">
                    <Image
                      src={logo.src}
                      alt={logo.alt}
                      fill
                      sizes="(max-width: 640px) 25vw, 150px"
                      className={`object-contain transition-transform duration-200 group-hover:scale-105 ${
                        logo.scale || "scale-100"
                      }`}
                    />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal delay={220}>
            <p className="mt-4 text-[10px] leading-relaxed text-muted">
              {isGu
                ? "સંસ્થાના નામ અમલમાં મૂકાયેલા પ્રોજેક્ટ્સનો સંદર્ભ આપે છે. આ ઓફરનું કોઈ સમર્થન સૂચિત નથી."
                : "Institution names refer to projects executed. No endorsement of this offer is implied."}
            </p>
          </Reveal>
        </div>

      </div>
    </section>
  );
}
