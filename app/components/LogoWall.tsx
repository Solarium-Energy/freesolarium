"use client";

import Image from "next/image";
import { useLanguage } from "../lib/language";

/* Each client's own mark, unchanged, with its short name. Width and height are the files' own sizes. */
const CLIENT_LOGOS = [
  { src: "/clients/indian-airforce.png", width: 250, height: 275, alt: "Indian Air Force", name: "Indian Air Force", guName: "ઇન્ડિયન એરફોર્સ" },
  { src: "/clients/indian-army.svg", width: 790, height: 600, alt: "Indian Army", name: "Indian Army", guName: "ઇન્ડિયન આર્મી" },
  { src: "/clients/drdo.png", width: 100, height: 100, alt: "DRDO", name: "DRDO", guName: "DRDO" },
  { src: "/clients/indian-railways.png", width: 800, height: 1358, alt: "Indian Railways", name: "Indian Railways", guName: "ઇન્ડિયન રેલવે" },
  { src: "/clients/ntpc.svg", width: 115, height: 69, alt: "NTPC", name: "NTPC", guName: "NTPC" },
  { src: "/clients/lic.png", width: 196, height: 97, alt: "LIC", name: "LIC", guName: "LIC" },
  { src: "/clients/geb.png", width: 565, height: 656, alt: "GUVNL (Gujarat Electricity Board)", name: "GUVNL", guName: "GUVNL (GEB)" },
  { src: "/clients/bank-of-india.png", width: 800, height: 380, alt: "Bank of India", name: "Bank of India", guName: "Bank of India" },
  { src: "/clients/itbp.png", width: 700, height: 845, alt: "ITBP", name: "ITBP", guName: "ITBP" },
  { src: "/clients/hindustan-petroleum.png", width: 416, height: 79, alt: "Hindustan Petroleum (HPCL)", name: "HPCL", guName: "HPCL" },
  { src: "/clients/counter-insurgency-force.svg", width: 400, height: 332, alt: "Counter Insurgency Force", name: "CI Force", guName: "CI Force" },
  { src: "/clients/agl.png", width: 600, height: 600, alt: "AGL", name: "AGL", guName: "AGL" },
  { src: "/clients/ahmedabad-university.png", width: 1041, height: 375, alt: "Ahmedabad University", name: "Ahmedabad Univ.", guName: "અમદાવાદ યુનિ." },
  { src: "/clients/gudc.png", width: 82, height: 102, alt: "Gujarat Urban Development Company", name: "GUDC", guName: "GUDC" },
  { src: "/clients/goa-shipyard.png", width: 353, height: 346, alt: "Goa Shipyard", name: "Goa Shipyard", guName: "Goa Shipyard" },
  { src: "/clients/bsf.png", width: 206, height: 218, alt: "Border Security Force", name: "BSF", guName: "BSF" },
];

export default function LogoWall() {
  const { isGu } = useLanguage();
  return (
    <section className="section is-mist" id="clients">
      <div className="wrap inst-g">
        <div data-mo-group="">
          <div className="eyebrow">{isGu ? "સંસ્થાકીય ટ્રેક રેકોર્ડ" : "Institutional track record"}</div>
          <h2 className="h-sub">
            {isGu
              ? "ભારતના સૌથી વધુ માંગવાળા સ્થળોએ અમે જે એન્જિનિયરિંગ પહોંચાડીએ છીએ"
              : "The engineering we deliver to India's most demanding sites"}
          </h2>
          <p>
            {isGu
              ? "સોલેરિયમે સશસ્ત્ર દળો, સંશોધન સંસ્થાઓ, જાહેર ક્ષેત્રના ઉપક્રમો અને ભારતની કેટલીક મોટી બેંકો માટે સૌર પ્રોજેક્ટ્સ અમલમાં મૂક્યા છે."
              : "Solarium has executed solar projects for the armed forces, research institutions, public sector undertakings and some of India's largest banks."}
          </p>
          <div className="dotline">
            {isGu ? "એ જ એન્જિનિયરિંગ ધોરણો, હવે તમારા છત પર." : "Same engineering standards, now on your rooftop."}
          </div>
        </div>
        <div>
          <div className="logo-wall" data-mo-group="pop">
            {CLIENT_LOGOS.map((logo) => (
              <div key={logo.src}>
                <Image src={logo.src} alt={logo.alt} width={logo.width} height={logo.height} sizes="92px" />
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
      </div>
    </section>
  );
}
