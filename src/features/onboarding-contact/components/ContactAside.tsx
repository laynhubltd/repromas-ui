import type { ContactChannel, ContactStep } from "../types";
import styles from "./ContactPage.module.css";

type ContactAsideProps = {
  nextStepsHeading: string;
  nextSteps: ContactStep[];
  directHeading: string;
  channels: ContactChannel[];
};

export function ContactAside({ nextStepsHeading, nextSteps, directHeading, channels }: ContactAsideProps) {
  return (
    <aside className={styles.aside} aria-label={nextStepsHeading}>
      <h2>{nextStepsHeading}</h2>
      <ol className={styles.steps}>
        {nextSteps.map((step, index) => (
          <li key={step.title}>
            <span className={styles.stepNumber} aria-hidden="true">
              {index + 1}
            </span>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </li>
        ))}
      </ol>

      <div className={styles.direct}>
        <h3>{directHeading}</h3>
        <dl>
          {channels.map((channel) => (
            <div key={channel.label} className={styles.channel}>
              <dt>{channel.label}</dt>
              <dd>
                <a href={channel.href} target={channel.href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">
                  {channel.value}
                </a>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </aside>
  );
}
