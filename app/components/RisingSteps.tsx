"use client";

import { JOURNEY } from "../lib/content";
import { useLanguage } from "../lib/language";

/* The rising curve of the design system's reference, drawn once. The steps sit on it and the last one is the sun. */
const CURVE = "M0.0 302.0 L13.3 295.2 L26.6 288.4 L39.9 281.8 L53.1 275.2 L66.4 268.8 L79.7 262.4 L93.0 256.2 L106.3 250.0 L119.6 243.9 L132.9 237.9 L146.2 232.0 L159.4 226.2 L172.7 220.5 L186.0 214.9 L199.3 209.4 L212.6 204.0 L225.9 198.6 L239.2 193.4 L252.5 188.3 L265.8 183.2 L279.0 178.2 L292.3 173.4 L305.6 168.6 L318.9 163.9 L332.2 159.3 L345.5 154.8 L358.8 150.4 L372.1 146.0 L385.3 141.8 L398.6 137.6 L411.9 133.6 L425.2 129.6 L438.5 125.7 L451.8 122.0 L465.1 118.3 L478.4 114.7 L491.6 111.1 L504.9 107.7 L518.2 104.4 L531.5 101.1 L544.8 97.9 L558.1 94.9 L571.4 91.9 L584.6 89.0 L597.9 86.2 L611.2 83.4 L624.5 80.8 L637.8 78.2 L651.1 75.8 L664.4 73.4 L677.7 71.1 L691.0 68.9 L704.2 66.8 L717.5 64.7 L730.8 62.8 L744.1 60.9 L757.4 59.1 L770.7 57.4 L784.0 55.8 L797.2 54.3 L810.5 52.8 L823.8 51.4 L837.1 50.1 L850.4 48.9 L863.7 47.8 L877.0 46.7 L890.3 45.8 L903.5 44.9 L916.8 44.1 L930.1 43.3 L943.4 42.7 L956.7 42.1 L970.0 41.6 L983.3 41.1 L996.6 40.8 L1009.9 40.5 L1023.1 40.3 L1036.4 40.1 L1049.7 40.0 L1063.0 40.0";
const NODES = [
  { x: 15.0, y: 294.3 },
  { x: 221.7, y: 200.3 },
  { x: 428.3, y: 128.7 },
  { x: 635.0, y: 78.8 },
  { x: 841.7, y: 49.7 },
  { x: 1048.3, y: 40.0 },
];
const SUN_RAYS = [-104, -78, -52, -26, 0, 26, 52, 78, 104];

/** How far along the curve a node sits, from 0 to 1: the curve's line reaches it at that point of the scroll. */
function reached(node: { x: number }) {
  return ((node.x / NODES[NODES.length - 1].x) * 0.94).toFixed(3);
}

/** Step numbers without the leading zero, in Gujarati digits in Gujarati. */
function stepNumber(step: (typeof JOURNEY)[number], isGu: boolean) {
  return (isGu ? step.guN : step.n).replace(/^[0૦]/, "");
}

export default function RisingSteps() {
  const { isGu } = useLanguage();
  const sun = NODES[NODES.length - 1];

  return (
    <section className="section" id="how">
      <div className="wrap">
        <div className="sec-head is-wide">
          <div data-mo-group="">
            <div className="eyebrow">{isGu ? "બુકિંગ કર્યા પછી" : "After you book"}</div>
            <h2 className="h-sec">{isGu ? "બુકિંગથી લઈને સોલર પાવર સુધી" : "From booking to solar power"}</h2>
          </div>
          <div data-mo-group="" data-mo-delay="2">
            <p className="lead">
              {isGu
                ? "છ પગલાં, એક જ ટીમ. તમને હંમેશા ખબર હશે કે આગળ શું થશે અને તેનો ખર્ચ કેટલો થશે."
                : "Six steps, one team. You always know what happens next and what it costs."}
            </p>
            <div className="badge-line">
              <b>{isGu ? "૬ પગલાં" : "6 Steps"}</b>
              {isGu ? "એક જ ઇન-હાઉસ (આંતરિક) ટીમ" : "One in-house team"}
            </div>
          </div>
        </div>

        <div className="rise" data-mo-scroll="enter">
          <svg viewBox="0 0 1240 330" aria-hidden="true">
            <defs>
              <radialGradient id="rise-sun" cx="50%" cy="30%" r="70%">
                <stop offset="0" className="stop-sun-core" />
                <stop offset=".6" className="stop-sun" />
                <stop offset="1" className="stop-sun-edge" />
              </radialGradient>
              <linearGradient id="rise-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" className="stop-brand-top" />
                <stop offset="1" className="stop-brand-bottom" />
              </linearGradient>
            </defs>
            <path className="area" d={`${CURVE} L1063.0 330 L0 330 Z`} fill="url(#rise-fill)" />
            <line className="base" x1="0" y1="329.5" x2="1240" y2="329.5" />
            <path className="curve" d={CURVE} pathLength={1} />
            {NODES.map((node, index) => (
              <line
                key={`drop-${index}`}
                className="drop"
                x1={node.x}
                y1={node.y}
                x2={node.x}
                y2="330"
                strokeDasharray="3 5"
                data-mo-at={reached(node)}
              />
            ))}
            {NODES.slice(0, -1).map((node, index) => (
              <g key={`node-${index}`} className="pt" data-mo-at={reached(node)}>
                <circle className="node" cx={node.x} cy={node.y} r="15" />
                <text x={node.x} y={node.y + 5} textAnchor="middle">
                  {stepNumber(JOURNEY[index], isGu)}
                </text>
              </g>
            ))}
            {/* The sun arrives when the curve reaches it. Its rays turn slowly, as a full ring so that they turn about its centre. */}
            <g className="sun-end" data-mo-at="0.97">
              <g className="sun-rays">
                <circle cx={sun.x} cy={sun.y} r="70" fill="none" />
                {SUN_RAYS.map((angle) => (
                  <polygon
                    key={angle}
                    className="ray"
                    points="-3,-44 3,-44 .8,-70 -.8,-70"
                    transform={`translate(${sun.x} ${sun.y}) rotate(${angle})`}
                  />
                ))}
              </g>
              <circle cx={sun.x} cy={sun.y} r="34" fill="url(#rise-sun)" />
              <text className="sun-n" x={sun.x} y={sun.y + 6} textAnchor="middle">
                {stepNumber(JOURNEY[JOURNEY.length - 1], isGu)}
              </text>
            </g>
          </svg>
        </div>

        <ol className="steps" data-mo-group="">
          {JOURNEY.map((step) => (
            <li className="s" key={step.n}>
              <span className="n" aria-hidden="true">
                {stepNumber(step, isGu)}
              </span>
              <span className="when">{isGu ? step.guWhen : step.when}</span>
              <h3>{isGu ? step.guTitle : step.title}</h3>
              <p>{isGu ? step.guBody : step.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
