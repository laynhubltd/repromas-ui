import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { CountPill, MarketingContainer } from "@/shared/ui/marketing";
import { PageSEO } from "@/shared/ui/PageSEO";
import { useContactPage } from "../hooks/useContactPage";
import { ContactAside } from "./ContactAside";
import { ContactForm } from "./ContactForm";
import styles from "./ContactPage.module.css";
import { ContactSuccess } from "./ContactSuccess";

export default function ContactPage() {
  const { seo, content, state, actions, flags } = useContactPage();

  return (
    <>
      <PageSEO title={seo.title} description={seo.description} />
      <section className={styles.hero}>
        <MarketingContainer className={styles.heroInner}>
          <CountPill>{content.hero.pill}</CountPill>
          <h1>{content.hero.title}</h1>
          <p>{content.hero.text}</p>
        </MarketingContainer>
      </section>

      <section className={styles.body}>
        <MarketingContainer className={styles.layout}>
          <div className={styles.card}>
            <ConditionalRenderer when={!flags.isSuccess}>
              <ContactForm
                form={state.form}
                initialValues={state.initialValues}
                copy={content.formCopy}
                options={content.options}
                submitLabel={state.submitLabel}
                isSubmitting={flags.isSubmitting}
                onFinish={actions.handleSubmit}
                onValuesChange={actions.handleValuesChange}
              />
            </ConditionalRenderer>
            <ConditionalRenderer when={flags.isSuccess}>
              <ContactSuccess
                copy={content.successCopy}
                name={state.submittedName}
                receipt={state.receipt}
                whatsappUrl={state.whatsappUrl}
                panelRef={state.successRef}
                onSendAnother={actions.handleSendAnother}
              />
            </ConditionalRenderer>
          </div>
          <ContactAside
            nextStepsHeading={content.nextStepsHeading}
            nextSteps={content.nextSteps}
            directHeading={content.directHeading}
            channels={content.channels}
          />
        </MarketingContainer>
      </section>
    </>
  );
}
