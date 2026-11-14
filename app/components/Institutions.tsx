"use client";

import Image from "next/image";
import { useLanguage } from "../lib/language";
import Reveal from "./Reveal";

const CLIENT_LOGOS = [
  { src: "/clients/indian-airforce.png", alt: "Indian Air Force", name: "Indian Air Force", guName: "ઇન્ડિયન એરફોર્સ", scale: "scale-[1.04]" },
  { src: "/clients/indian-army.svg",     alt: "Indian Army", name: "Indian Army", guName: "ઇન્ડિયન આર્મી", scale: "scale-[0.80]" },
  { src: "/clients/drdo.png",             alt: "DRDO", name: "DRDO", guName: "DRDO", scale: "scale-[0.80]" },
  { src: "/clients/indian-railways.png", alt: "Indian Railways", name: "Indian Railways", guName: "ઇન્ડિયન રેલવે", scale: "scale-[1.04]" },
  { src: "/clients/ntpc.svg",            alt: "NTPC", name: "NTPC", guName: "NTPC", scale: "scale-[0.85]" },
  { src: "/clients/lic.png",             alt: "LIC", name: "LIC", guName: "LIC", scale: "scale-[0.85]" },
  { src: "/clients/geb.png",             alt: "GUVNL (Gujarat Electricity Board)", name: "GUVNL", guName: "GUVNL (GEB)", scale: "scale-[0.82]" },
  { src: "/clients/bank-of-india.png",   alt: "Bank of India", name: "Bank of India", guName: "Bank of India", scale: "scale-[0.85]" },
  { src: "/clients/itbp.png",            alt: "ITBP", name: "ITBP", guName: "ITBP", scale: "scale-[1.04]" },
  { src: "/clients/hindustan-petroleum.png", alt: "Hindustan Petroleum (HPCL)", name: "HPCL", guName: "HPCL", scale: "scale-[0.82]" },
  { src: "/clients/counter-insurgency-force.svg", alt: "Counter Insurgency Force", name: "CI Force", guName: "CI Force", scale: "scale-[0.80]" },
  { src: "/clients/agl.png",             alt: "AGL", name: "AGL", guName: "AGL", scale: "scale-[0.85]" },
  { src: "/clients/ahmedabad-university.png", alt: "Ahmedabad University", name: "Ahmedabad Univ.", guName: "અમદાવાદ યુનિ.", scale: "scale-[0.85]" },
  { src: "/clients/gudc.png",            alt: "Gujarat Urban Development Company", name: "GUDC", guName: "GUDC", scale: "scale-[0.85]" },
  { src: "/clients/goa-shipyard.png",    alt: "Goa Shipyard", name: "Goa Shipyard", guName: "Goa Shipyard", scale: "scale-[0.85]" },
  { src: "/clients/bsf.png",             alt: "Border Security Force", name: "BSF", guName: "BSF", scale: "scale-[0.82]" },
];

export default function Institutions() {
  const { isGu } = useLanguage();
  return (
    <section id="clients" className="border-y border-line bg-white py-14 lg:py-20">
      <div className="mx-auto grid max-w-[1200px] gap-9 px-5 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-14 lg:px-6">

        {/* ── Left: copy ── */}
        <Reveal direction="left">
          <div>
            <p className="section-label text-orange">
              {isGu ? "સંસ્થાકીય ટ્રેક રેકોર્ડ" : "Institutional track record"}
            </p>
            <h2 className="mt-3.5 section-heading text-navy max-w-[18ch]">
              {isGu
                ? "ભારતના સૌથી વધુ માંગવાળા સ્થળોએ અમે જે એન્જિનિયરિંગ પહોંચાડીએ છીએ"
                : "The engineering we deliver to India's most demanding sites"}
            </h2>
            <p className="mt-3.5 section-body max-w-[34rem] text-body">
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
                <div className="group flex h-[82px] flex-col items-center justify-between rounded-xl border border-line bg-paper/60 p-2 transition-all duration-200 hover:border-line-strong hover:bg-white hover:shadow-sm sm:h-[94px] sm:p-2.5">
                  <div className="relative flex h-9 w-full flex-1 items-center justify-center sm:h-11">
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
                  <p
                    className="mt-1 w-full truncate text-center text-[9.5px] font-bold tracking-tight text-navy/80 transition-colors group-hover:text-navy sm:text-[11px]"
                    title={isGu && logo.guName ? logo.guName : logo.name}
                  >
                    {isGu && logo.guName ? logo.guName : logo.name}
                  </p>
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
