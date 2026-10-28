import { Button, Form, Input, Radio, Select } from "antd";
import type { FormInstance } from "antd";
import { Link } from "react-router-dom";
import type { ContactFormValues, ContactOption, ContactInstitutionType, ContactRole, ContactTopic, StudentPopulationBand } from "../types";
import type { CONTACT_FORM_COPY } from "../utils/contact-content";
import {
  contactEmailRules,
  contactInstitutionRules,
  contactInstitutionTypeRules,
  contactMessageRules,
  contactNameRules,
  contactPhoneRules,
  contactRoleRules,
  contactTopicRules,
} from "../utils/validators";
import styles from "./ContactPage.module.css";

type ContactFormProps = {
  form: FormInstance<ContactFormValues>;
  initialValues: Partial<ContactFormValues>;
  copy: typeof CONTACT_FORM_COPY;
  options: {
    topics: ContactOption<ContactTopic>[];
    institutionTypes: ContactOption<ContactInstitutionType>[];
    roles: ContactOption<ContactRole>[];
    studentPopulations: ContactOption<StudentPopulationBand>[];
  };
  submitLabel: string;
  isSubmitting: boolean;
  onFinish: (values: ContactFormValues) => void;
  onValuesChange: (changed: Partial<ContactFormValues>) => void;
};

export function ContactForm({
  form,
  initialValues,
  copy,
  options,
  submitLabel,
  isSubmitting,
  onFinish,
  onValuesChange,
}: ContactFormProps) {
  return (
    <Form
      form={form}
      layout="vertical"
      requiredMark="optional"
      validateTrigger="onBlur"
      initialValues={initialValues}
      onFinish={onFinish}
      onValuesChange={onValuesChange}
      scrollToFirstError={{ focus: true, block: "center" }}
      className={styles.form}
      aria-label={copy.heading}
    >
      <h2 className={styles.formHeading}>{copy.heading}</h2>

      <Form.Item name="topic" label={copy.topicLabel} rules={contactTopicRules} validateTrigger="onChange">
        <Radio.Group optionType="button" options={options.topics} className={styles.topics} />
      </Form.Item>

      <div className={styles.row}>
        <Form.Item name="fullName" label={copy.fullNameLabel} rules={contactNameRules}>
          <Input autoComplete="name" maxLength={120} />
        </Form.Item>
        <Form.Item name="email" label={copy.emailLabel} extra={copy.emailHint} rules={contactEmailRules}>
          <Input type="email" inputMode="email" autoComplete="email" maxLength={180} />
        </Form.Item>
      </div>

      <Form.Item name="institution" label={copy.institutionLabel} rules={contactInstitutionRules}>
        <Input autoComplete="organization" maxLength={160} />
      </Form.Item>

      <div className={styles.row}>
        <Form.Item name="institutionType" label={copy.institutionTypeLabel} rules={contactInstitutionTypeRules} validateTrigger="onChange">
          <Select options={options.institutionTypes} placeholder={copy.selectPlaceholder} />
        </Form.Item>
        <Form.Item name="role" label={copy.roleLabel} rules={contactRoleRules} validateTrigger="onChange">
          <Select options={options.roles} placeholder={copy.selectPlaceholder} />
        </Form.Item>
      </div>

      <div className={styles.row}>
        <Form.Item name="phone" label={copy.phoneLabel} extra={copy.phoneHint} rules={contactPhoneRules}>
          <Input type="tel" inputMode="tel" autoComplete="tel" maxLength={24} />
        </Form.Item>
        <Form.Item name="studentPopulation" label={copy.studentPopulationLabel}>
          <Select options={options.studentPopulations} placeholder={copy.selectPlaceholder} allowClear />
        </Form.Item>
      </div>

      <Form.Item name="message" label={copy.messageLabel} rules={contactMessageRules}>
        <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} maxLength={2000} placeholder={copy.messagePlaceholder} />
      </Form.Item>

      <div className={styles.honeypot} aria-hidden="true">
        <Form.Item name="website" label="Leave this field empty">
          <Input tabIndex={-1} autoComplete="off" />
        </Form.Item>
      </div>

      <div className={styles.submitRow}>
        <Button htmlType="submit" size="large" loading={isSubmitting} className={styles.submit}>
          {isSubmitting ? copy.submitting : submitLabel}
        </Button>
        <p className={styles.privacy}>
          {copy.privacy} <Link to={copy.privacyHref}>{copy.privacyLinkLabel}</Link>.
        </p>
      </div>
    </Form>
  );
}
