// Feature: auth/candidate-signup
import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { CANDIDATE_GENDER_OPTIONS } from "@/shared/constants/admissionCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  firstNameRules,
  jambRegNoRules,
  lastNameRules,
  stateIdRules,
} from "@/features/admission-candidate/utils/validators";
import { LockOutlined, UserOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Select,
  Spin,
  Typography,
} from "antd";
import { Link } from "react-router-dom";
import { useCandidateSignUpPage } from "../hooks/useCandidateSignUpPage";

const { Title, Text } = Typography;

function BlockedMessage({
  reason,
}: {
  reason: "not_open" | "ambiguous" | "wrong_status" | null;
}) {
  if (reason === "not_open" || reason === "wrong_status") {
    return (
      <Alert
        type="info"
        showIcon
        message="Admissions are not open"
        description="There is no active admission process at this time. Please check back later."
      />
    );
  }
  if (reason === "ambiguous") {
    return (
      <Alert
        type="warning"
        showIcon
        message="Unable to start registration"
        description="Multiple admission cycles are open. Please contact the institution for assistance."
      />
    );
  }
  return null;
}

export function CandidateSignUpPage() {
  const t = useToken();
  const { state, actions, flags, forms, validators } = useCandidateSignUpPage();
  const {
    config,
    cycleDateLabel,
    step,
    blockedReason,
    formError,
    lookupResult,
    states,
    lgas,
    isConfigLoading,
    isStatesLoading,
    isLgasLoading,
    isLookupLoading,
    isSignupLoading,
    openStateId,
  } = state;
  const {
    handleJambLookup,
    handleJambSignup,
    handleOpenSignup,
    handleOpenStateChange,
    backToJambLookup,
  } = actions;
  const { isBlocked, isBootstrap } = flags;
  const { jambLookupForm, jambSignupForm, openSignupForm } = forms;

  const inputStyle = {
    height: t.controlHeightLG,
    fontSize: t.fontSize,
  };

  return (
    <AuthPageLayout illustration="signup">
      <div style={{ textAlign: "center", marginBottom: t.sizeLG }}>
        <Title
          level={2}
          style={{
            margin: 0,
            marginBottom: t.sizeXS,
            color: t.colorText,
            fontWeight: t.fontWeightStrong,
          }}
        >
          {config?.name ?? "Candidate registration"}
        </Title>
        {cycleDateLabel && (
          <Text type="secondary" style={{ fontSize: t.fontSizeSM }}>
            {cycleDateLabel}
          </Text>
        )}
      </div>

      <ErrorAlert error={formError} />

      {(isBootstrap || isConfigLoading) && (
        <div style={{ textAlign: "center", padding: t.sizeXL }}>
          <Spin />
        </div>
      )}

      {isBlocked && !isConfigLoading && (
        <BlockedMessage reason={blockedReason} />
      )}

      {step === "jamb_lookup" && !isConfigLoading && (
        <Form
          form={jambLookupForm}
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={handleJambLookup}
        >
          <Text type="secondary" style={{ display: "block", marginBottom: t.sizeMD }}>
            Enter your JAMB registration number to verify your CAPS record.
          </Text>
          <Form.Item name="jambRegNo" rules={jambRegNoRules}>
            <Input placeholder="JAMB registration number" style={inputStyle} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isLookupLoading}
              style={{
                height: t.controlHeightLG,
                fontWeight: t.fontWeightStrong,
              }}
            >
              Verify JAMB record
            </Button>
          </Form.Item>
        </Form>
      )}

      {step === "jamb_details" && lookupResult && (
        <>
          <Descriptions
            bordered
            size="small"
            column={1}
            style={{ marginBottom: t.sizeLG }}
          >
            <Descriptions.Item label="Name">
              {lookupResult.firstName} {lookupResult.lastName}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">{lookupResult.gender}</Descriptions.Item>
            <Descriptions.Item label="State">{lookupResult.state}</Descriptions.Item>
            <Descriptions.Item label="LGA">{lookupResult.lga}</Descriptions.Item>
            <Descriptions.Item label="Applied program">
              {lookupResult.appliedProgram}
            </Descriptions.Item>
          </Descriptions>

          <Form
            form={jambSignupForm}
            layout="vertical"
            size="large"
            requiredMark={false}
            onFinish={handleJambSignup}
          >
            <Form.Item name="email" rules={validators.emailRules}>
              <Input
                prefix={<UserOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="Email address"
                type="email"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item name="password" rules={validators.passwordRules}>
              <Input.Password
                prefix={<LockOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="Password"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Please confirm your password" },
                ({ getFieldValue }) => ({
                  validator(_: unknown, value: string) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Passwords do not match"));
                  },
                }),
              ]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="Confirm password"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item name="phone">
              <Input placeholder="Phone (optional)" style={inputStyle} />
            </Form.Item>
            <Form.Item style={{ marginBottom: t.sizeSM }}>
              <Button
                type="primary"
                htmlType="submit"
                block
                loading={isSignupLoading}
                style={{
                  height: t.controlHeightLG,
                  fontWeight: t.fontWeightStrong,
                }}
              >
                Create account
              </Button>
            </Form.Item>
            <Button type="link" block onClick={backToJambLookup}>
              Use a different JAMB number
            </Button>
          </Form>
        </>
      )}

      {step === "open_form" && !isConfigLoading && (
        <Form
          form={openSignupForm}
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={handleOpenSignup}
        >
          <Form.Item name="firstName" label="First name" rules={firstNameRules}>
            <Input style={inputStyle} />
          </Form.Item>
          <Form.Item name="lastName" label="Last name" rules={lastNameRules}>
            <Input style={inputStyle} />
          </Form.Item>
          <Form.Item name="dateOfBirth" label="Date of birth" rules={[{ required: true, message: "Date of birth is required" }]}>
            <DatePicker style={{ width: "100%", height: t.controlHeightLG }} />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={[{ required: true, message: "Gender is required" }]}>
            <Select
              placeholder="Select gender"
              options={CANDIDATE_GENDER_OPTIONS}
            />
          </Form.Item>
          <Form.Item name="stateId" label="State" rules={stateIdRules}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder="Select state"
              loading={isStatesLoading}
              options={states.map((s) => ({ value: s.id, label: s.name }))}
              onChange={handleOpenStateChange}
            />
          </Form.Item>
          <Form.Item name="lgaId" label="LGA" rules={[{ required: true, message: "LGA is required" }]}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={openStateId ? "Select LGA" : "Select state first"}
              disabled={!openStateId}
              loading={isLgasLoading}
              options={lgas.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={validators.emailRules}>
            <Input type="email" style={inputStyle} />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={validators.passwordRules}>
            <Input.Password style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Please confirm your password" },
              ({ getFieldValue }) => ({
                validator(_: unknown, value: string) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("Passwords do not match"));
                },
              }),
            ]}
          >
            <Input.Password style={inputStyle} />
          </Form.Item>
          <Form.Item name="phone" label="Phone">
            <Input placeholder="Optional" style={inputStyle} />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={isSignupLoading}
              style={{
                height: t.controlHeightLG,
                fontWeight: t.fontWeightStrong,
              }}
            >
              Create account
            </Button>
          </Form.Item>
        </Form>
      )}

      <div
        style={{
          textAlign: "center",
          paddingTop: t.sizeLG,
          marginTop: t.sizeLG,
          borderTop: `1px solid ${t.colorBorderSecondary}`,
        }}
      >
        <Text type="secondary" style={{ fontSize: t.fontSizeSM }}>
          Already have an account?{" "}
          <Link to={appPaths.login} className="auth-link" style={{ fontWeight: 500 }}>
            Sign in
          </Link>
        </Text>
      </div>
    </AuthPageLayout>
  );
}
