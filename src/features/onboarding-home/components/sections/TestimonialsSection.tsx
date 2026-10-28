import { MarketingContainer, MarketingSection, SectionHeading } from "@/shared/ui/marketing";
import type { Testimonial } from "../../types";
import styles from "../HomePage.module.css";

type TestimonialsSectionProps = {
  testimonials: Testimonial[];
};

export function TestimonialsSection({ testimonials }: TestimonialsSectionProps) {
  return (
    <MarketingSection className={styles.quotesSection}>
      <MarketingContainer>
        <SectionHeading
          title="What Our Institutions Say"
          description="From registries, bursaries and ICT directorates that run REPROMAS."
        />
        <div className={styles.quotes}>
          {testimonials.map((testimonial) => (
            <figure key={testimonial.name} className={styles.quote}>
              <span className={styles.quoteMark} aria-hidden="true">
                "
              </span>
              <blockquote>{testimonial.quote}</blockquote>
              <figcaption className={styles.quoteWho}>
                {testimonial.photoUrl ? (
                  <img src={testimonial.photoUrl} alt="" loading="lazy" />
                ) : (
                  <span className={styles.avatar} aria-hidden="true" />
                )}
                <span>
                  <strong>{testimonial.name}</strong>
                  <span>
                    {testimonial.role}, {testimonial.institution}
                  </span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </MarketingContainer>
    </MarketingSection>
  );
}
