import { FAQ } from "@/lib/structured-data";

export default function Faq() {
  return (
    <section className="section wrap" id="faq">
      <div className="section-head reveal">
        <span className="eyebrow">Questions</span>
        <h2>
          The short <em>answers.</em>
          <a
            className="anchor-link"
            href="#faq"
            aria-label="Permalink to Questions"
          >
            #
          </a>
        </h2>
      </div>
      <div className="faq-list reveal">
        {FAQ.map((item, index) => (
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
