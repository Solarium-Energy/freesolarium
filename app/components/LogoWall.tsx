"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { useLanguage } from "../lib/language";

/* Each client's own mark, unchanged, with its short name. Width and height are the files' own sizes.
   `cap`: the largest size the file allows at two times density, where that is below the size of a mark
   (76px high and 124px wide from 768 wide). These three are shown at that smaller size. */
type Logo = { src: string; width: number; height: number; alt: string; name: string; guName: string; cap?: [number, number] };

const CLIENT_LOGOS: Logo[] = [
  { src: "/clients/indian-airforce.png", width: 250, height: 275, alt: "Indian Air Force", name: "Indian Air Force", guName: "ઇન્ડિયન એરફોર્સ" },
  { src: "/clients/indian-army.svg", width: 790, height: 600, alt: "Indian Army", name: "Indian Army", guName: "ઇન્ડિયન આર્મી" },
  { src: "/clients/drdo.png", width: 100, height: 100, alt: "DRDO", name: "DRDO", guName: "DRDO", cap: [50, 50] },
  { src: "/clients/indian-railways.png", width: 800, height: 1358, alt: "Indian Railways", name: "Indian Railways", guName: "ઇન્ડિયન રેલવે" },
  { src: "/clients/ntpc.svg", width: 115, height: 69, alt: "NTPC", name: "NTPC", guName: "NTPC" },
  { src: "/clients/lic.png", width: 196, height: 97, alt: "LIC", name: "LIC", guName: "LIC", cap: [98, 48] },
  { src: "/clients/geb.png", width: 565, height: 656, alt: "GUVNL (Gujarat Electricity Board)", name: "GUVNL", guName: "GUVNL (GEB)" },
  { src: "/clients/bank-of-india.png", width: 800, height: 380, alt: "Bank of India", name: "Bank of India", guName: "Bank of India" },
  { src: "/clients/itbp.png", width: 700, height: 845, alt: "ITBP", name: "ITBP", guName: "ITBP" },
  { src: "/clients/hindustan-petroleum.png", width: 416, height: 79, alt: "Hindustan Petroleum (HPCL)", name: "HPCL", guName: "HPCL" },
  { src: "/clients/counter-insurgency-force.svg", width: 400, height: 332, alt: "Counter Insurgency Force", name: "CI Force", guName: "CI Force" },
  { src: "/clients/agl.png", width: 600, height: 600, alt: "AGL", name: "AGL", guName: "AGL" },
  { src: "/clients/ahmedabad-university.png", width: 1041, height: 375, alt: "Ahmedabad University", name: "Ahmedabad Univ.", guName: "અમદાવાદ યુનિ." },
  { src: "/clients/gudc.png", width: 82, height: 102, alt: "Gujarat Urban Development Company", name: "GUDC", guName: "GUDC", cap: [41, 51] },
  { src: "/clients/goa-shipyard.png", width: 353, height: 346, alt: "Goa Shipyard", name: "Goa Shipyard", guName: "Goa Shipyard" },
  { src: "/clients/bsf.png", width: 206, height: 218, alt: "Border Security Force", name: "BSF", guName: "BSF" },
];

export default function LogoWall() {
  const { isGu } = useLanguage();
  return (
    <section className="section is-mist" id="clients">
      <div className="wrap">
        <div className="sec-head">
          <div data-mo-group="">
            <div className="eyebrow">{isGu ? "સંસ્થાકીય ટ્રેક રેકોર્ડ" : "Institutional track record"}</div>
            <h2 className="h-sec">
              {isGu ? "ભારતની સૌથી વધુ માંગ ધરાવતી સંસ્થાઓનો ભરોસો" : "Trusted by India's most demanding institutions"}
            </h2>
          </div>
          <div data-mo-group="" data-mo-delay="2">
            <p className="lead">
              {isGu
                ? "સશસ્ત્ર દળો, સંશોધન સંસ્થાઓ, જાહેર ક્ષેત્રના ઉપક્રમો અને ભારતની કેટલીક સૌથી મોટી બેંકો સોલેરિયમ પર ભરોસો રાખે છે, લદ્દાખના ટેલિસ્કોપ સ્ટેશન જેવી મુશ્કેલ સાઇટ્સ પર અને સોલર તથા પવન ઊર્જાના હાઇબ્રિડ પ્લાન્ટ્સમાં પણ."
                : "The armed forces, research institutions, public sector undertakings and some of India's largest banks rely on Solarium, on sites as hard as a telescope station in Ladakh and solar and wind hybrid plants."}
            </p>
            <div className="dotline">
              {isGu
                ? "એ જ એન્જિનિયરિંગ હવે તમારી છત પર. તમે યોગ્ય હાથમાં છો."
                : "The same engineering is now on your roof. You are in the right hands."}
            </div>
          </div>
        </div>
        {/* The marks carry the section: over the full width, eight in a row from 1120 wide, four below. */}
        <div className="logo-wall is-wide" data-mo-group="pop">
          {CLIENT_LOGOS.map((logo) => (
            <div key={logo.src}>
              <Image
                src={logo.src}
                alt={logo.alt}
                width={logo.width}
                height={logo.height}
                sizes="(max-width: 767px) 70px, 124px"
                style={logo.cap ? ({ "--cap-w": `${logo.cap[0]}px`, "--cap-h": `${logo.cap[1]}px` } as CSSProperties) : undefined}
              />
              {isGu ? logo.guName : logo.name}
            </div>
          ))}
        </div>
        <small className="fine" data-mo="fade">
          {isGu
            ? "સંસ્થાના નામ અમલમાં મૂકાયેલા પ્રોજેક્ટ્સનો સંદર્ભ આપે છે. આ ઓફરનું કોઈ સમર્થન સૂચિત નથી."
            : "Institution names refer to projects executed. No endorsement of this offer is implied."}
        </small>
      </div>
    </section>
  );
}
