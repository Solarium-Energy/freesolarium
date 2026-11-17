"use client";

import { useLanguage } from "../lib/language";

const PILLARS = [
  {
    n: "01",
    title: "STT - Solarium\nTrusted Technology",
    guTitle: "STT - સોલેરિયમ (Solarium)\nભરોસાપાત્ર ટેકનોલોજી",
    body: "Maximum power generation with inhouse Solarium panel.",
    guBody: "ઇન-હાઉસ 'સોલેરિયમ' પેનલ્સ દ્વારા મહત્તમ વીજ ઉત્પાદન.",
  },
  {
    n: "02",
    title: "Super Solid\nStructure",
    guTitle: "સુપર સોલિડ (અત્યંત મજબૂત)\nસ્ટ્રક્ચર (માળખું)",
    body: "Steady and stable even in strong wind.",
    guBody: "તેજ પવનોમાં પણ અડગ અને સ્થિર.",
  },
  {
    n: "03",
    title: "Stress-Free\nProcess",
    guTitle: "તણાવમુક્ત\nપ્રક્રિયા",
    body: "Subsidy, DISCOM, bank, system engineering and installation, everything we will handle.",
    guBody:
      "સબસિડી, ડિસ્કોમ (DISCOM), બેંક, સિસ્ટમ એન્જિનિયરિંગ અને ઇન્સ્ટોલેશન, આ બધું જ અમે સંભાળી લઈશું.",
  },
  {
    n: "04",
    title: "Service Promise\nBest-in-Class",
    guTitle: "સેવાનું વચન\nશ્રેષ્ઠ કક્ષાની સેવા",
    body: "Single contact for all support you need. On-call helpline, free visit if required, service warranty of 5 years.",
    guBody:
      "તમને જોઈતી તમામ સહાય માટે એક જ સંપર્ક બિંદુ. ઓન-કોલ હેલ્પલાઇન, જરૂર પડે તો નિઃશુલ્ક મુલાકાત અને 5 વર્ષની સર્વિસ વોરંટી.",
  },
  {
    n: "05",
    title: "Safety &\nSecurity",
    guTitle: "સલામતી અને\nસુરક્ષા",
    body: "Extended warranty at every step, free insurance of 5 years.",
    guBody: "દરેક તબક્કે વિસ્તૃત વોરંટી અને 5 વર્ષનો મફત વીમો.",
  },
  {
    n: "06",
    title: "Speed of\nExecution",
    guTitle: "અમલીકરણની\nઝડપ",
    body: "Fastest in the current market. 15 days installation promise.",
    guBody: "વર્તમાન બજારમાં સૌથી ઝડપી. 15 દિવસમાં ઇન્સ્ટોલેશનનું વચન.",
  },
] as const;

const ANGLES = [-75, -45, -15, 15, 45, 75];

/** Six rays around a small sun. The ray that belongs to this column is lit, so the six columns together draw one sun. */
function RayMark({ lit }: { lit: number }) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true">
      <circle cx="28" cy="50" r="5" className="lit" />
      {ANGLES.map((angle, index) =>
        index === lit ? (
          <polygon key={angle} className="lit" points="-3.2,-10 3.2,-10 .8,-46 -.8,-46" transform={`translate(28 50) rotate(${angle})`} />
        ) : (
          <polygon key={angle} className="dim" points="-2,-10 2,-10 .5,-34 -.5,-34" transform={`translate(28 50) rotate(${angle})`} />
        )
      )}
    </svg>
  );
}

export default function SixRays() {
  const { isGu } = useLanguage();
  return (
    <section className="section is-night on-dark" id="six-s">
      <div className="glass" aria-hidden="true" />
      <div className="wrap">
        <div className="eyebrow" data-mo="">{isGu ? "6S (સિક્સ-એસ)" : "The 6S"}</div>
        <h2 className="h-sec" data-mo="" data-mo-delay="1">{isGu ? "છ અનિવાર્ય આધારસ્તંભો પર નિર્મિત." : "Built on six non-negotiables."}</h2>
        <div className="rays-six" data-mo-group="">
          {PILLARS.map((pillar, index) => (
            <div className="c" key={pillar.n}>
              <RayMark lit={index} />
              <u>{pillar.n}</u>
              {/* The titles run on one line: the line break of the old cards becomes a space. */}
              <h3>{(isGu ? pillar.guTitle : pillar.title).replace("\n", " ")}</h3>
              <p>{isGu ? pillar.guBody : pillar.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
