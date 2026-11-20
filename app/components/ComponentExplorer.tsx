"use client";

import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Image from "next/image";
import { type CSSProperties, Fragment, useEffect, useEffectEvent, useRef, useState } from "react";
import { CERTIFICATIONS, INCLUDED } from "../lib/content";
import { useLanguage } from "../lib/language";
import IconButton from "./ui/IconButton";
import { cx } from "./ui/cx";

const COUNT = INCLUDED.length;
const two = (n: number) => String(n).padStart(2, "0");
/** The index splits after the panels and the inverter: the other eight are where low-cost systems cut corners. */
const SPLIT = 2;
const PHONE_QUERY = "(max-width: 767px)";

type Component = (typeof INCLUDED)[number];

/**
 * A component's photo. Five photos show several parts side by side: they are shown whole, fitted to the circle,
 * over a blurred, enlarged copy of themselves that fills it. The others fill the circle.
 */
function Photo({ item, on, sizes, alt }: { item: Component; on: boolean; sizes: string; alt: string }) {
  return (
    <div className={cx("ph", item.whole && "is-whole", on && "is-on")} aria-hidden={on ? undefined : true}>
      {item.whole && (
        <Image className="bg" src={item.image} alt="" width={1774} height={887} sizes={sizes} loading="lazy" />
      )}
      <Image className="fg" src={item.image} alt={alt} width={1774} height={887} sizes={sizes} loading="lazy" />
    </div>
  );
}

/** "What you get": the section head and the explorer for the ten system components. */
export default function ComponentExplorer() {
  const { isGu } = useLanguage();
  const [at, setAt] = useState(0);
  // How far the arc of the disc has travelled, in tenths of a turn. It always takes the short way round.
  const [turn, setTurn] = useState(0);
  // Whether the reader has chosen a component yet: only then do the lines of a panel come in one after another.
  const [moved, setMoved] = useState(false);
  const listRef = useRef<HTMLOListElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);
  // On a phone, the card a pill or an arrow is bringing into view. The row passes others on its way there.
  const goingTo = useRef<number | null>(null);

  function choose(next: number) {
    const way = ((next - at + COUNT + COUNT / 2) % COUNT) - COUNT / 2;
    setTurn(turn + way);
    setAt(next);
    setMoved(true);
    // Below 1120px the list is a row of pills that scrolls sideways: keep the chosen one in view.
    const list = listRef.current;
    const item = list?.querySelector<HTMLElement>(`[data-index="${next}"]`);
    if (list && item && list.scrollWidth > list.clientWidth) {
      list.scrollLeft = item.offsetLeft - list.offsetLeft - 16;
    }
  }

  /** A pill or an arrow. On a phone it also brings that card into view: gliding, or at once without motion. */
  function show(index: number) {
    const next = (index + COUNT) % COUNT;
    choose(next);
    const row = cardsRef.current;
    const card = row?.children[next] as HTMLElement | undefined;
    if (row && card && window.matchMedia(PHONE_QUERY).matches) {
      goingTo.current = next;
      const moving = document.documentElement.classList.contains("mo");
      row.scrollTo({ left: card.offsetLeft, behavior: moving ? "smooth" : "auto" });
    }
  }

  /** On a phone the pills and the count follow the card in view. Nothing moves the cards by itself. */
  const onCardsScroll = useEffectEvent(() => {
    const row = cardsRef.current;
    if (!row || !window.matchMedia(PHONE_QUERY).matches || row.children.length < 2) return;
    const step = (row.children[1] as HTMLElement).offsetLeft - (row.children[0] as HTMLElement).offsetLeft;
    const index = Math.max(0, Math.min(COUNT - 1, Math.round(row.scrollLeft / step)));
    if (goingTo.current !== null) {
      if (index !== goingTo.current) return;
      goingTo.current = null;
    }
    if (index !== at) choose(index);
  });

  useEffect(() => {
    const row = cardsRef.current;
    if (!row) return;
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => onCardsScroll());
    };
    // A finger on the row takes over from a glide that a pill or an arrow started.
    const onTouch = () => {
      goingTo.current = null;
    };
    row.addEventListener("scroll", onScroll, { passive: true });
    row.addEventListener("pointerdown", onTouch, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      row.removeEventListener("scroll", onScroll);
      row.removeEventListener("pointerdown", onTouch);
    };
  }, []);

  const groupNote = isGu ? (
    <>
      જ્યાં સસ્તી સિસ્ટમ્સ બાંધછોડ કરે છે. <b>અમે નહીં.</b>
    </>
  ) : (
    <>
      Where low-cost systems cut corners. <b>We do not.</b>
    </>
  );

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
                ? "₹0 ખર્ચનો અર્થ એ નથી કે તમને કોઈ અધૂરી કે મર્યાદિત સુવિધાઓવાળી કિટ મળશે. આ એ જ સિસ્ટમ છે જે અમે તમામ ઓર્ડરમાં ઇન્સ્ટોલ કરીએ છીએ, જે એક જ કંપની દ્વારા ડિઝાઇન કરવામાં આવી છે, પૂરી પાડવામાં આવી છે અને કાર્યરત (commissioned) કરવામાં આવી છે."
                : "Effective ₹0 does not mean a stripped-down kit. This is the same system we install on all orders, designed, supplied and commissioned by one company."}
            </p>
            <div className="note-pill">
              <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8-7.5 9.5-4.4-1.5-7.5-4.9-7.5-9.5V6z" />
                <path d="M8.5 12l2.5 2.5 4.5-5" />
              </svg>
              <div>
                <b>{isGu ? "૫ વર્ષનો વીમો મફત" : "5-year insurance included free"}</b>
                {isGu
                  ? "શૂન્ય વધારાના ખર્ચે વીમાથી સુરક્ષિત, માત્ર સોલેરિયમ તરફથી."
                  : "Insured at zero extra cost, exclusively from Solarium."}
              </div>
            </div>
          </div>
        </div>

        <div className="index-detail">
          <div data-mo="left">
            <div className="lbl" id="explorer-label">
              {isGu ? "તમામ ૧૦ પ્રમાણિત ઘટકો" : "Explore all 10 certified components"}
            </div>
            {/* Where the index is a row of pills, the note stands above the row. */}
            <p className="index-note is-above">{groupNote}</p>
            <ol className="index-list" ref={listRef} aria-labelledby="explorer-label">
              {INCLUDED.map((item, index) => (
                <Fragment key={item.title}>
                  {/* In the list on a desktop the note stands above the eight: text, not a choice. */}
                  {index === SPLIT && (
                    <li className="index-note is-between" role="presentation">
                      {groupNote}
                    </li>
                  )}
                  <li data-index={index} className={index === at ? "is-on" : undefined}>
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
                </Fragment>
              ))}
            </ol>
          </div>

          {/* All ten photos are in the disc from the start, loaded as the section comes near. Only the chosen
              one is seen, so a choice shows its photo at once. The disc is not shown on a phone. */}
          <div className="disc" data-mo="pop" data-moved={moved ? "" : undefined} style={{ "--mo-turn": turn } as CSSProperties}>
            <div className="ring" />
            <div className="arc" />
            {INCLUDED.map((item, index) => (
              <Photo
                key={item.title}
                item={item}
                on={index === at}
                alt={isGu ? item.guImageAlt : item.imageAlt}
                sizes="(max-width: 1119px) 320px, 468px"
              />
            ))}
            <div className="n" aria-hidden="true" key={at}>
              {two(at + 1)}
            </div>
          </div>

          <div data-mo="right">
            {/* Every panel is in the page and they all share one place, as tall as the tallest of them.
                So the pager under them stays where it is, whichever component is shown.
                On a phone they are a row of cards that moves sideways with the finger. */}
            <div className="details" ref={cardsRef} data-moved={moved ? "" : undefined}>
              {INCLUDED.map((item, index) => (
                <div className={index === at ? "detail is-on" : "detail"} id={`component-${index + 1}`} key={item.title}>
                  <div className="mini">
                    <Photo item={item} on alt={isGu ? item.guImageAlt : item.imageAlt} sizes="200px" />
                  </div>
                  <span className="tag">{isGu ? item.guTag : item.tag}</span>
                  <h3>{isGu ? item.guTitle : item.title}</h3>
                  {item.full && <div className="it">{isGu ? item.guSubtitle : item.subtitle}</div>}
                  <p>{isGu ? item.guBody : item.body}</p>
                  {item.full && (
                    <ul className="specs">
                      {(isGu ? item.guSpecs : item.specs).map((spec) => (
                        <li key={spec}>
                          <Check className="ico" aria-hidden="true" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
            <div className="pager">
              <IconButton label="Previous component" size="lg" onClick={() => show(at - 1)}>
                <ArrowLeft className="ico" aria-hidden="true" />
              </IconButton>
              <IconButton label="Next component" size="lg" solid onClick={() => show(at + 1)}>
                <ArrowRight className="ico" aria-hidden="true" />
              </IconButton>
              <span>
                {two(at + 1)} / {two(COUNT)}
              </span>
            </div>
          </div>
        </div>

        {/* Solarium's certifications, in words only. A phone shows no facts on the cards, so this row matters there. */}
        <div className="certs">
          <h3 className="certs-h">
            <svg className="ico" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 3l7.5 3v5.5c0 4.6-3.1 8-7.5 9.5-4.4-1.5-7.5-4.9-7.5-9.5V6z" />
              <path d="M8.5 12l2.5 2.5 4.5-5" />
            </svg>
            {isGu ? CERTIFICATIONS.guHeading : CERTIFICATIONS.heading}
          </h3>
          {/* The six cells arrive one after another, as the cells of the stats band do. */}
          <ul className="certs-g" data-mo-group="">
            {CERTIFICATIONS.items.map((item) => (
              <li className="bracket" key={item.title}>
                <b>{isGu ? item.guTitle : item.title}</b>
                <span>{isGu ? item.guNote : item.note}</span>
              </li>
            ))}
          </ul>
          <small className="fine">{isGu ? CERTIFICATIONS.guFine : CERTIFICATIONS.fine}</small>
        </div>
      </div>
    </section>
  );
}
