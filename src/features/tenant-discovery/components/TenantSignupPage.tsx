import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Button,
  Card,
  ColorPicker,
  Flex,
  Form,
  Input,
  Steps,
  Typography,
} from "antd";
import { useTenantSignup } from "../hooks/useTenantSignup";
import {
  codeRules,
  emailRules,
  nameRules,
  primaryColorRules,
  slugRules,
} from "../utils/validators";

export default function TenantSignupPage() {
  const { state, actions, form } = useTenantSignup();
  const { fontSizeSM } = useToken();

  const { currentStep, isSubmitting, isRedirecting, formError, slugPreviewUrl } = state;
  const { handleNext, handleBack, handleSubmit, handleNameChange, handleSlugManualEdit } = actions;

  return (
    <div style={{ padding: 24, maxWidth: 640, margin: "0 auto" }}>
      <Typography.Title level={2} style={{ marginBottom: 8 }}>
        School Signup
      </Typography.Title>
      <Typography.Paragraph type="secondary" style={{ marginTop: 0, marginBottom: 24 }}>
        Register your institution to get started.
      </Typography.Paragraph>

      <Steps
        current={currentStep}
        style={{ marginBottom: 24 }}
        items={[{ title: "Basic Info" }, { title: "Branding" }]}
      />

      <Card>
        <Form form={form} layout="vertical" requiredMark="optional">
          <ErrorAlert error={formError} />

          {/* ── Step 1: Basic Info ─────────────────────────────────────── */}
          <ConditionalRenderer when={currentStep === 0}>
            <Form.Item name="name" label="Institution Name" rules={nameRules}>
              <Input
                placeholder="e.g. University of Lagos"
                autoComplete="off"
                onChange={(e) => handleNameChange(e.target.value)}
              />
            </Form.Item>

            <Form.Item name="code" label="Tenant Code" rules={codeRules}>
              <Input placeholder="e.g. UNILAG" autoComplete="off" />
            </Form.Item>

            <Form.Item name="slug" label="Tenant Slug" rules={slugRules}>
              <Input
                placeholder="e.g. university-of-lagos"
                autoComplete="off"
                onChange={handleSlugManualEdit}
              />
            </Form.Item>

            <ConditionalRenderer when={!!slugPreviewUrl}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: fontSizeSM, display: "block", marginTop: -16, marginBottom: 24 }}
              >
                Your tenant URL: {slugPreviewUrl}
              </Typography.Text>
            </ConditionalRenderer>

            <Form.Item name="email" label="Contact Email" rules={emailRules}>
              <Input type="email" placeholder="e.g. admin@university.edu" autoComplete="off" />
            </Form.Item>

            <Form.Item name="customDomain" label="Custom Domain">
              <Input placeholder="e.g. portal.university.edu" autoComplete="off" />
            </Form.Item>
          </ConditionalRenderer>

          {/* ── Step 2: Branding ───────────────────────────────────────── */}
          <ConditionalRenderer when={currentStep === 1}>
            <Form.Item
              name="primaryColor"
              label="Primary Colour"
              rules={primaryColorRules}
              getValueFromEvent={(color) => color.toHexString()}
            >
              <ColorPicker format="hex" />
            </Form.Item>

            <Form.Item name="logoUrl" label="Logo URL">
              <Input placeholder="https://example.com/logo.png" autoComplete="off" />
            </Form.Item>

            <Form.Item name="tagline" label="Tagline">
              <Input placeholder="e.g. Excellence in Education" autoComplete="off" />
            </Form.Item>

            <Form.Item name="address" label="Address">
              <Input placeholder="e.g. 123 University Road, Lagos" autoComplete="off" />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input placeholder="e.g. +234 800 000 0000" autoComplete="off" />
            </Form.Item>
          </ConditionalRenderer>
        </Form>

        {/* ── Navigation buttons ─────────────────────────────────────── */}
        <Flex justify="space-between" style={{ marginTop: 8 }}>
          <ConditionalRenderer when={currentStep === 1}>
            <Button onClick={handleBack}>Back</Button>
          </ConditionalRenderer>

          <ConditionalRenderer when={currentStep === 0}>
            <Button type="primary" onClick={handleNext} style={{ marginLeft: "auto" }}>
              Next
            </Button>
          </ConditionalRenderer>

          <ConditionalRenderer when={currentStep === 1}>
            <Button
              type="primary"
              onClick={handleSubmit}
              loading={isSubmitting || isRedirecting}
              disabled={isSubmitting || isRedirecting}
            >
              {isRedirecting ? "Redirecting…" : "Submit"}
            </Button>
          </ConditionalRenderer>
        </Flex>
      </Card>
    </div>
  );
}
