import { Button } from "antd";
import type { RefObject } from "react";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import type { ContactRequestReceipt } from "../types";
import type { CONTACT_SUCCESS_COPY } from "../utils/contact-content";
import styles from "./ContactPage.module.css";

type ContactSuccessProps = {
  copy: typeof CONTACT_SUCCESS_COPY;
  name: string;
  receipt: ContactRequestReceipt | null;
  whatsappUrl: string | null;
  panelRef: RefObject<HTMLDivElement | null>;
  onSendAnother: () => void;
};

export function ContactSuccess({ copy, name, receipt, whatsappUrl, panelRef, onSendAnother }: ContactSuccessProps) {
  return (
    <div ref={panelRef} className={styles.success} tabIndex={-1} role="status" data-testid="contact-success">
      <svg className={styles.successIcon} viewBox="0 0 48 48" aria-hidden="true">
        <circle cx="24" cy="24" r="22" />
        <path d="M14 25l7 7 13-15" />
      </svg>
      <h2>
        {copy.title}
        {name ? `, ${name}` : ""}
      </h2>
      <p>{copy.text}</p>
      <ConditionalRenderer when={Boolean(receipt)}>
        <p className={styles.reference}>
          {copy.referenceLabel}: <strong>{receipt?.reference}</strong>
        </p>
      </ConditionalRenderer>
      <ConditionalRenderer when={Boolean(whatsappUrl)}>
        <a className={styles.successLink} href={whatsappUrl ?? undefined} target="_blank" rel="noreferrer">
          {copy.whatsapp}
        </a>
      </ConditionalRenderer>
      <Button type="link" onClick={onSendAnother} className={styles.sendAnother}>
        {copy.sendAnother}
      </Button>
    </div>
  );
}
