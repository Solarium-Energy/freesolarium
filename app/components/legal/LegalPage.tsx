import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { site } from "../../lib/content";
import type { LegalBlock, LegalDocument } from "../../lib/legal";
import Footer from "../Footer";
import Header from "../Header";
import { BackHome, EnglishOnlyNote, LegalEyebrow } from "./LegalChrome";

/* Email addresses, the phone number and this site's two page addresses become links. The words stay as they are. */
const LINKABLE = new RegExp(
  `([\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+)|(${site.phoneDisplay.replace(/ /g, "\\s")})|(solariumenergy\\.org\\/(?:privacy|terms))\\b`,
  "g"
);

function withLinks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(LINKABLE)) {
    const at = match.index ?? 0;
    if (at > last) parts.push(text.slice(last, at));
    const [whole, email, phone, page] = match;
    if (email) {
      parts.push(
        <a key={at} className="link" href={`mailto:${email}`}>
          {whole}
        </a>
      );
    } else if (phone) {
      parts.push(
        <a key={at} className="link" href={site.phoneHref}>
          {whole}
        </a>
      );
    } else if (page) {
      parts.push(
        <Link key={at} className="link" href={page.slice(page.indexOf("/"))}>
          {whole}
        </Link>
      );
    }
    last = at + whole.length;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function Block({ block }: { block: LegalBlock }) {
  if (block.type === "list") {
    return (
      <ul>
        {block.items.map((item) => (
          <li key={item}>{withLinks(item)}</li>
        ))}
      </ul>
    );
  }
  return <p>{withLinks(block.text)}</p>;
}

/**
 * One legal document as a page: the shell of every page, the head, the text and the way back.
 * A server component, so the whole text is in the server HTML.
 */
export default function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <>
      <Header />
      <main>
        <section className="section legal">
          <div className="wrap">
            <article className="legal-doc">
              <header className="legal-head">
                <LegalEyebrow />
                <h1 className="h-sec" lang="en">
                  {document.title}
                </h1>
                <p className="legal-updated" lang="en">
                  {document.updated}
                </p>
              </header>
              <EnglishOnlyNote />
              <div className="legal-body t-body" lang="en">
                {document.intro.map((block, index) => (
                  <Block key={`intro-${index}`} block={block} />
                ))}
                {document.sections.map((section) => (
                  <Fragment key={section.id}>
                    <h2 id={section.id} className="t-display-6">
                      {section.heading}
                    </h2>
                    {section.blocks.map((block, index) => (
                      <Block key={`${section.id}-${index}`} block={block} />
                    ))}
                  </Fragment>
                ))}
              </div>
              <p className="legal-back">
                <BackHome />
              </p>
            </article>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
