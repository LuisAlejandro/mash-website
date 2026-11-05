import type { FaqItem } from "@/lib/structured-data";
import type { Locale } from "@/lib/i18n/locale";
import { MARKETING } from "@/lib/i18n/marketing";

export default function Faq({
  items,
  locale,
}: {
  items: FaqItem[];
  locale: Locale;
}) {
  const copy = MARKETING[locale].faq;

  return (
    <section className="section wrap" id="faq">
      <div className="section-head reveal">
        <span className="eyebrow">{copy.eyebrow}</span>
        <h2>
          {copy.heading.text}
          <em>{copy.heading.emphasis}</em>
          <a
            className="anchor-link"
            href="#faq"
            aria-label={`${MARKETING[locale].permalink}${copy.label}`}
          >
            #
          </a>
        </h2>
      </div>
      <div className="faq-list reveal">
        {items.map((item, index) => (
          <details className="faq-item" key={item.question} open={index === 0}>
            <summary>
              <span className="faq-q">{item.question}</span>
            </summary>
            <p>{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
