"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, useRef, useState } from "react";
import { INCLUDED } from "../lib/content";
import { useLanguage } from "../lib/language";
import IconButton from "./ui/IconButton";

const COUNT = INCLUDED.length;
const two = (n: number) => String(n).padStart(2, "0");

/** "What you get": the section head and the explorer for the ten system components. */
export default function ComponentExplorer() {
  const { isGu } = useLanguage();
  const [at, setAt] = useState(0);
  // How far the arc of the disc has travelled, in tenths of a turn. It always takes the short way round.
  const [turn, setTurn] = useState(0);
  const listRef = useRef<HTMLOListElement>(null);
  const current = INCLUDED[at];

  function show(index: number) {
    const next = (index + COUNT) % COUNT;
    const way = ((next - at + COUNT + COUNT / 2) % COUNT) - COUNT / 2;
    setTurn(turn + way);
    setAt(next);
    // Below 1120px the list is a row of pills that scrolls sideways: keep the chosen one in view.
    const list = listRef.current;
    const item = list?.children[next] as HTMLElement | undefined;
    if (list && item && list.scrollWidth > list.clientWidth) {
      list.scrollLeft = item.offsetLeft - list.offsetLeft - 16;
    }
  }

  return (
    <section className="section" id="product">
      <div className="wrap">
        <div className="sec-head">
          <div data-mo-group="">
            <div className="eyebrow">{isGu ? "તમને શું મળશે" : "What you get"}</div>
            {isGu ? (
              <h2 className="h-sec">
                સંપૂર્ણ સિસ્ટમ.
                <br />
                તમારે બહારથી કંઈપણ ખરીદવાની જરૂર નથી.
              </h2>
            ) : (
              <h2 className="h-sec">
                Complete system.
                <br />
                Nothing to source yourself.
              </h2>
            )}
          </div>
          <div data-mo-group="" data-mo-delay="2">
            <p className="lead">
              {isGu
                ? "₹0 ખર્ચનો અર્થ એ નથી કે તમને કોઈ અધૂરી કે મર્યાદિત સુવિધાઓવાળી કિટ મળશે. આ એ જ સિસ્ટમ છે જે અમે પેઇડ ઓર્ડર (જેના માટે ચૂકવણી કરવામાં આવી છે) હેઠળ ઇન્સ્ટોલ કરીએ છીએ, જે એક જ કંપની દ્વારા ડિઝાઇન કરવામાં આવી છે, પૂરી પાડવામાં આવી છે અને કાર્યરત (commissioned) કરવામાં આવી છે."
                : "Effective ₹0 does not mean a stripped-down kit. This is the same system we install on paid orders, designed, supplied and commissioned by one company."}
            </p>
            <div className="note-pill">
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8-7.5 9.5-4.4-1.5-7.5-4.9-7.5-9.5V6z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" />
              </svg>
              <div>
                <b>{isGu ? "૫ વર્ષનો વીમો મફત" : "5-year insurance included free"}</b>
                {isGu
                  ? "કોઈ વધારાના ખર્ચ વિના સંપૂર્ણ સુરક્ષા, માત્ર સોલેરિયમ સાથે."
                  : "Complete protection at ₹0 extra cost, exclusively from Solarium."}
              </div>
            </div>
          </div>
        </div>

        <div className="index-detail">
          <div data-mo="left">
            <div className="lbl" id="explorer-label">
              {isGu ? "તમામ ૧૦ પ્રમાણિત ઘટકો" : "Explore all 10 certified components"}
            </div>
            <ol className="index-list" ref={listRef} aria-labelledby="explorer-label">
              {INCLUDED.map((item, index) => (
                <li key={item.title} className={index === at ? "is-on" : undefined}>
                  <button
                    type="button"
                    aria-current={index === at ? "true" : undefined}
                    aria-controls={`component-${index + 1}`}
                    onClick={() => show(index)}
                  >
                    <u>{two(index + 1)}</u>
                    {isGu ? item.guTitle : item.title}
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="disc" data-mo="pop" style={{ "--mo-turn": turn } as CSSProperties}>
            <div className="ring" />
            <div className="arc" />
            <Image
              src={current.image}
              alt={isGu ? current.guImageAlt : current.imageAlt}
              width={1774}
              height={887}
              sizes="(max-width: 767px) 260px, (max-width: 1119px) 320px, 468px"
              loading={at === 0 ? "eager" : "lazy"}
              onLoad={(event) => {
                // The new picture settles in. The old one stays until the new one has loaded.
                if (!document.documentElement.classList.contains("mo")) return;
                event.currentTarget.animate([{ opacity: 0.35, scale: "1.05" }, { opacity: 1, scale: "1" }], {
                  duration: 650,
                  easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                });
              }}
            />
            <div className="n" aria-hidden="true" key={at}>
              {two(at + 1)}
            </div>
          </div>

          {/* Every panel is in the page, the ones not chosen are hidden. */}
          {INCLUDED.map((item, index) => (
            <div className="detail" id={`component-${index + 1}`} key={item.title} hidden={index !== at} data-mo="right">
              <span className="tag">{isGu ? item.guTag : item.tag}</span>
              <h3>{isGu ? item.guTitle : item.title}</h3>
              <div className="it">{isGu ? item.guSubtitle : item.subtitle}</div>
              <p>{isGu ? item.guBody : item.body}</p>
              <ul className="specs">
                {(isGu ? item.guSpecs : item.specs).map((spec) => (
                  <li key={spec}>
                    <Check className="ico" aria-hidden="true" />
                    {spec}
                  </li>
                ))}
              </ul>
              <div className="pager">
                <IconButton label="Previous component" size="lg" onClick={() => show(at - 1)}>
                  <ArrowLeft className="ico" aria-hidden="true" />
                </IconButton>
                <IconButton label="Next component" size="lg" solid onClick={() => show(at + 1)}>
                  <ArrowRight className="ico" aria-hidden="true" />
                </IconButton>
                <span>
                  {two(index + 1)} / {two(COUNT)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
