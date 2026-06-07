// Feature: auth/candidate-signup
import { appPaths } from "@/app/routing/app-path";
import { AuthPageLayout } from "@/components/auth/AuthPageLayout";
import { formatEntryBatchLabel } from "@/features/admission-config/tabs/admission-cycle/utils/admissionCycleDisplay";
import { CANDIDATE_GENDER_OPTIONS } from "@/shared/constants/admissionCandidateOptions";
import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
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
import type { CandidateSignupBlockedReason } from "../state/candidateSignupState";
import {
  confirmPasswordRules,
  dateOfBirthRules,
  emailRules,
  firstNameRules,
  genderRules,
  jambRegNoRules,
  lastNameRules,
  lgaIdRules,
  passwordRules,
  stateIdRules,
} from "../utils/validators";

const { Title, Text } = Typography;

function BlockedMessage({
  reason,
}: {
  reason: CandidateSignupBlockedReason | null;
}) {
  if (reason === "not_open" || reason === "wrong_status") {
    return (
      <Alert
        type="info"
        showIcon
        message={CANDIDATE_SIGNUP_UI_COPY.blockedNotOpenTitle}
        description={CANDIDATE_SIGNUP_UI_COPY.blockedNotOpenDescription}
      />
    );
  }
  if (reason === "ambiguous") {
    return (
      <Alert
        type="warning"
        showIcon
        message={CANDIDATE_SIGNUP_UI_COPY.blockedAmbiguousTitle}
        description={CANDIDATE_SIGNUP_UI_COPY.blockedAmbiguousDescription}
      />
    );
  }
  return null;
}

export function CandidateSignUpPage() {
  const t = useToken();
  const { state, actions, flags, forms } = useCandidateSignUpPage();
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

  const entryBatchLabel =
    config !== undefined && config !== null
      ? formatEntryBatchLabel(config.entryMode, config.batchNo)
      : null;

  return (
    <AuthPageLayout illustration="signup" fillViewport backTo={appPaths.login}>
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
          {config?.name ?? CANDIDATE_SIGNUP_UI_COPY.pageTitleFallback}
        </Title>
        {entryBatchLabel !== null ? (
          <Text
            type="secondary"
            style={{ display: "block", fontSize: t.fontSizeSM }}
          >
            {entryBatchLabel}
          </Text>
        ) : null}
        {cycleDateLabel ? (
          <Text type="secondary" style={{ fontSize: t.fontSizeSM }}>
            {cycleDateLabel}
          </Text>
        ) : null}
      </div>

      <ErrorAlert error={formError} />

      {(isBootstrap || isConfigLoading) && (
        <div style={{ textAlign: "center", padding: t.sizeXL }}>
          <Spin />
        </div>
      )}

      {isBlocked && !isConfigLoading ? (
        <BlockedMessage reason={blockedReason} />
      ) : null}

      {step === "jamb_lookup" && !isConfigLoading ? (
        <Form
          form={jambLookupForm}
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={handleJambLookup}
        >
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: t.sizeMD }}
          >
            {CANDIDATE_SIGNUP_UI_COPY.jambLookupIntro}
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
      ) : null}

      {step === "jamb_details" && lookupResult ? (
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
            <Descriptions.Item label="Gender">
              {lookupResult.gender}
            </Descriptions.Item>
            <Descriptions.Item label="State">
              {lookupResult.state}
            </Descriptions.Item>
            <Descriptions.Item label="LGA">
              {lookupResult.lga}
            </Descriptions.Item>
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
            <Form.Item name="email" rules={emailRules}>
              <Input
                prefix={<UserOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="Email address"
                type="email"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item name="password" rules={passwordRules}>
              <Input.Password
                prefix={<LockOutlined style={{ color: t.colorTextTertiary }} />}
                placeholder="Password"
                style={inputStyle}
              />
            </Form.Item>
            <Form.Item
              name="confirmPassword"
              dependencies={["password"]}
              rules={confirmPasswordRules(() =>
                jambSignupForm.getFieldValue("password"),
              )}
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
      ) : null}

      {step === "open_form" && !isConfigLoading ? (
        <Form
          form={openSignupForm}
          layout="vertical"
          size="large"
          requiredMark={false}
          onFinish={handleOpenSignup}
        >
          <Text
            type="secondary"
            style={{ display: "block", marginBottom: t.sizeMD }}
          >
            {CANDIDATE_SIGNUP_UI_COPY.openSignupIntro}
          </Text>
          <Form.Item name="firstName" label="First name" rules={firstNameRules}>
            <Input style={inputStyle} />
          </Form.Item>
          <Form.Item name="lastName" label="Last name" rules={lastNameRules}>
            <Input style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="dateOfBirth"
            label="Date of birth"
            rules={dateOfBirthRules}
          >
            <DatePicker style={{ width: "100%", height: t.controlHeightLG }} />
          </Form.Item>
          <Form.Item name="gender" label="Gender" rules={genderRules}>
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
          <Form.Item name="lgaId" label="LGA" rules={lgaIdRules}>
            <Select
              showSearch
              optionFilterProp="label"
              placeholder={openStateId ? "Select LGA" : "Select state first"}
              disabled={!openStateId}
              loading={isLgasLoading}
              options={lgas.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={emailRules}>
            <Input type="email" style={inputStyle} />
          </Form.Item>
          <Form.Item name="password" label="Password" rules={passwordRules}>
            <Input.Password style={inputStyle} />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirm password"
            dependencies={["password"]}
            rules={confirmPasswordRules(() =>
              openSignupForm.getFieldValue("password"),
            )}
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
      ) : null}

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
          <Link
            to={appPaths.login}
            className="auth-link"
            style={{ fontWeight: 500 }}
          >
            Sign in
          </Link>
        </Text>
      </div>
    </AuthPageLayout>
  );
}
