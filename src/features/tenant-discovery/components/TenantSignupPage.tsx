import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { Button, ColorPicker, Form, Input, Select, Steps } from "antd";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { CountPill, MarketingContainer } from "@/shared/ui/marketing";
import { PageSEO } from "@/shared/ui/PageSEO";
import { useTenantSignup } from "../hooks/useTenantSignup";
import {
  INSTITUTION_CATEGORIES,
  INSTITUTION_TYPE_OPTIONS,
} from "../utils/institution-types";
import {
  codeRules,
  contactEmailRules,
  customDomainRules,
  emailRules,
  facebookRules,
  fullAddressRules,
  getPostalCodeRules,
  institutionTypeRules,
  linkedinRules,
  mottoRules,
  nameRules,
  phoneRules,
  primaryColorRules,
  slugRules,
  taglineRules,
  twitterRules,
  youtubeRules,
} from "../utils/validators";
import { SignupLogoPicker } from "./SignupLogoPicker";
import styles from "./TenantSignupPage.module.css";
import { TenantSignupSuccess } from "./TenantSignupSuccess";

const SIGNUP_STEPS = [
  {
    title: "Instant Workspace Provisioning",
    text: "Your dedicated institution subdomain (your-institution.repromas.app) is created immediately with no operator approval bottleneck.",
  },
  {
    title: "Administrator Activation via Email",
    text: "An activation link is dispatched to your work email. Click the link to set your password and access your dashboard.",
  },
  {
    title: "Full Results Cycle at Your Own Pace",
    text: "Test your institution's curricula, grading systems, and approval ladders, backed by a 6-month free trial subscription.",
  },
] as const;

export default function TenantSignupPage() {
  const { state, actions, form } = useTenantSignup();
  const [showSocial, setShowSocial] = useState(false);

  const {
    currentStep,
    isSubmitting,
    isCompleted,
    formError,
    slugPreviewUrl,
    logoMode,
    logoFile,
    createdResponse,
    states,
    isStatesLoading,
    isNigerianState,
  } = state;

  const {
    handleNext,
    handleBack,
    handleSubmit,
    handleNameChange,
    handleCodeChange,
    handleSlugManualEdit,
    setLogoMode,
    setLogoFile,
  } = actions;

  // Group states for select dropdown
  const stateSelectOptions = useMemo(
    () =>
      states.map((s) => ({
        value: s.id,
        label: `${s.name} (${s.code})`,
      })),
    [states],
  );

  return (
    <>
      <PageSEO
        title="Try REPROMAS for Free — Create Your Institution Workspace"
        description="Set up your institution's isolated REPROMAS subdomain in two minutes and start testing admissions, course registration, and senate results immediately."
      />
      <section className={styles.hero}>
        <MarketingContainer className={styles.heroInner}>
          <CountPill>Try for Free</CountPill>
          <h1>Create Your Institution&apos;s REPROMAS Workspace</h1>
          <p>
            Start your free 6-month trial. Your dedicated workspace is provisioned immediately with zero operator
            approval required.
          </p>
        </MarketingContainer>
      </section>

      <section className={styles.body}>
        <MarketingContainer className={styles.layout}>
          <div className={styles.card}>
            {isCompleted && createdResponse ? (
              <TenantSignupSuccess response={createdResponse} />
            ) : (
              <>
                <h2 className={styles.formHeading}>Institution Workspace Registration</h2>
                <p className={styles.formSub}>
                  Step {currentStep + 1} of 3 —{" "}
                  {currentStep === 0
                    ? "Basic Info & Administrator"
                    : currentStep === 1
                      ? "Brand Identity & Logo"
                      : "Campus Location & Contact"}
                </p>

                <Steps
                  current={currentStep}
                  className={styles.stepsBar}
                  items={[
                    { title: "Institution & Admin" },
                    { title: "Brand Identity" },
                    { title: "Location & Contact" },
                  ]}
                />

                <Form
                  form={form}
                  layout="vertical"
                  requiredMark="optional"
                  initialValues={{
                    primaryColor: "#2E1065",
                    logoMode: "upload",
                  }}
                  className={styles.form}
                >
                  <ErrorAlert error={formError} />

                  {/* ── Step 0: Basic Info & Admin ───────────────────────────── */}
                  <ConditionalRenderer when={currentStep === 0}>
                    <Form.Item name="name" label="Institution Name" rules={nameRules}>
                      <Input
                        size="large"
                        placeholder="e.g. Kano State Polytechnic"
                        autoComplete="off"
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </Form.Item>

                    <Form.Item
                      name="institutionType"
                      label="Institution Type"
                      rules={institutionTypeRules}
                      extra="Drives academic structure and degree classification rules across your portal."
                    >
                      <Select size="large" placeholder="Select institutional category and tier">
                        {INSTITUTION_CATEGORIES.map((cat) => (
                          <Select.OptGroup key={cat} label={cat}>
                            {INSTITUTION_TYPE_OPTIONS.filter((opt) => opt.category === cat).map((opt) => (
                              <Select.Option key={opt.value} value={opt.value}>
                                {opt.label}
                              </Select.Option>
                            ))}
                          </Select.OptGroup>
                        ))}
                      </Select>
                    </Form.Item>

                    <div className={styles.row}>
                      <Form.Item
                        name="code"
                        label="Institution Code"
                        rules={codeRules}
                        extra="2–20 uppercase characters (e.g. KANOPOLY)"
                      >
                        <Input
                          size="large"
                          placeholder="e.g. KANOPOLY"
                          autoComplete="off"
                          onChange={(e) => handleCodeChange(e.target.value)}
                        />
                      </Form.Item>

                      <Form.Item
                        name="slug"
                        label="Tenant Subdomain Slug"
                        rules={slugRules}
                        extra="Used in your portal address and headers"
                      >
                        <Input
                          size="large"
                          placeholder="e.g. kanopoly"
                          suffix=".repromas.app"
                          autoComplete="off"
                          onChange={handleSlugManualEdit}
                        />
                      </Form.Item>
                    </div>

                    <ConditionalRenderer when={!!slugPreviewUrl}>
                      <div className={styles.slugPreview}>
                        Your dedicated portal address: <strong>{slugPreviewUrl}</strong>
                      </div>
                    </ConditionalRenderer>

                    <div className={styles.row}>
                      <Form.Item
                        name="email"
                        label="Administrator Work Email"
                        rules={emailRules}
                        extra="Receives your initial System Administrator account and password activation link."
                      >
                        <Input
                          size="large"
                          type="email"
                          placeholder="e.g. admin@kanopoly.edu.ng"
                          autoComplete="off"
                        />
                      </Form.Item>

                      <Form.Item
                        name="customDomain"
                        label="Custom Domain (Optional)"
                        rules={customDomainRules}
                        extra="Can also be mapped later in System Settings"
                      >
                        <Input
                          size="large"
                          placeholder="e.g. portal.kanopoly.edu.ng"
                          autoComplete="off"
                        />
                      </Form.Item>
                    </div>
                  </ConditionalRenderer>

                  {/* ── Step 1: Brand Identity & Logo ─────────────────────────── */}
                  <ConditionalRenderer when={currentStep === 1}>
                    <Form.Item
                      name="primaryColor"
                      label="Primary Brand Colour"
                      rules={primaryColorRules}
                      getValueFromEvent={(color) => color.toHexString()}
                      extra="Applied across portal headers, navigation, and student broadsheets."
                    >
                      <ColorPicker format="hex" showText size="large" />
                    </Form.Item>

                    <Form.Item
                      label="Institution Crest / Logo"
                      extra="Cropped to 512×512 px. PNG transparency is preserved."
                    >
                      <SignupLogoPicker
                        logoFile={logoFile}
                        onLogoFileChange={setLogoFile}
                        logoMode={logoMode}
                        onLogoModeChange={setLogoMode}
                        disabled={isSubmitting}
                      />
                    </Form.Item>

                    <div className={styles.row}>
                      <Form.Item name="tagline" label="Institutional Tagline" rules={taglineRules}>
                        <Input
                          size="large"
                          placeholder="e.g. Technology for Self Reliance"
                          autoComplete="off"
                        />
                      </Form.Item>

                      <Form.Item name="motto" label="Official Motto" rules={mottoRules}>
                        <Input
                          size="large"
                          placeholder="e.g. Work and Progress"
                          autoComplete="off"
                        />
                      </Form.Item>
                    </div>
                  </ConditionalRenderer>

                  {/* ── Step 2: Location, Contact & Social ─────────────────────── */}
                  <ConditionalRenderer when={currentStep === 2}>
                    <Form.Item
                      name="fullAddress"
                      label="Campus Street Address"
                      rules={fullAddressRules}
                    >
                      <Input.TextArea
                        autoSize={{ minRows: 2, maxRows: 4 }}
                        placeholder="e.g. Matan Fada Road, Kano Campus"
                        autoComplete="off"
                      />
                    </Form.Item>

                    <div className={styles.row}>
                      <Form.Item
                        name="stateId"
                        label="State / Province"
                        extra="Sets geographical context for admission rules"
                      >
                        <Select
                          size="large"
                          showSearch
                          placeholder="Select state"
                          loading={isStatesLoading}
                          options={stateSelectOptions}
                          filterOption={(input, option) =>
                            (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                          }
                          allowClear
                        />
                      </Form.Item>

                      <Form.Item
                        name="postalCode"
                        label="Postal Code"
                        rules={getPostalCodeRules(isNigerianState)}
                        extra={isNigerianState ? "Requires 6-digit Nigerian postal code (e.g. 700001)" : undefined}
                      >
                        <Input
                          size="large"
                          placeholder={isNigerianState ? "e.g. 700001" : "e.g. 10001"}
                          autoComplete="off"
                        />
                      </Form.Item>
                    </div>

                    <div className={styles.row}>
                      <Form.Item
                        name="phone"
                        label="Official Phone Number"
                        rules={phoneRules}
                        extra="Format: 0803 123 4567 or +234..."
                      >
                        <Input
                          size="large"
                          placeholder="e.g. +234 803 123 4567"
                          autoComplete="off"
                        />
                      </Form.Item>

                      <Form.Item
                        name="contactEmail"
                        label="Public Enquiries Email"
                        rules={contactEmailRules}
                        extra="Defaults to administrator email if left empty"
                      >
                        <Input
                          size="large"
                          type="email"
                          placeholder="e.g. info@kanopoly.edu.ng"
                          autoComplete="off"
                        />
                      </Form.Item>
                    </div>

                    {/* Collapsible Social Links */}
                    <div className={styles.socialSection}>
                      <div
                        className={styles.socialHeader}
                        onClick={() => setShowSocial((prev) => !prev)}
                      >
                        <h4>Social & Web Presence (Optional)</h4>
                        {showSocial ? <DownOutlined /> : <RightOutlined />}
                      </div>

                      <ConditionalRenderer when={showSocial}>
                        <div style={{ marginTop: 16 }}>
                          <div className={styles.row}>
                            <Form.Item name="facebook" label="Facebook URL" rules={facebookRules}>
                              <Input placeholder="https://facebook.com/..." />
                            </Form.Item>
                            <Form.Item name="twitter" label="X (Twitter) URL" rules={twitterRules}>
                              <Input placeholder="https://x.com/..." />
                            </Form.Item>
                          </div>
                          <div className={styles.row}>
                            <Form.Item name="linkedin" label="LinkedIn URL" rules={linkedinRules}>
                              <Input placeholder="https://linkedin.com/school/..." />
                            </Form.Item>
                            <Form.Item name="youtube" label="YouTube Channel URL" rules={youtubeRules}>
                              <Input placeholder="https://youtube.com/@..." />
                            </Form.Item>
                          </div>
                        </div>
                      </ConditionalRenderer>
                    </div>
                  </ConditionalRenderer>

                  {/* ── Navigation buttons ───────────────────────────────────── */}
                  <div className={styles.actionsRow}>
                    <ConditionalRenderer when={currentStep > 0}>
                      <Button size="large" className={styles.backBtn} onClick={handleBack} disabled={isSubmitting}>
                        Back
                      </Button>
                    </ConditionalRenderer>

                    <ConditionalRenderer when={currentStep < 2}>
                      <Button type="primary" size="large" className={styles.primaryBtn} onClick={handleNext}>
                        Continue
                      </Button>
                    </ConditionalRenderer>

                    <ConditionalRenderer when={currentStep === 2}>
                      <Button
                        type="primary"
                        size="large"
                        className={styles.primaryBtn}
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? "Provisioning Workspace…" : "Create Workspace & Launch"}
                      </Button>
                    </ConditionalRenderer>
                  </div>
                </Form>
              </>
            )}
          </div>

          <aside className={styles.aside} aria-label="What happens next">
            <h2>Instant Self-Service Onboarding</h2>
            <ol className={styles.steps}>
              {SIGNUP_STEPS.map((step, index) => (
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
              <h3>Prefer a guided consultation first?</h3>
              <p>
                Our team can walk your Vice-Chancellor, Registrar, and ICT Director through a full results cycle or
                prepare a procurement pack.
              </p>
              <Link to="/contact">Talk to an Advisor →</Link>
            </div>
          </aside>
        </MarketingContainer>
      </section>
    </>
  );
}
