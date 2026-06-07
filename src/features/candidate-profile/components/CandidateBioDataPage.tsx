import { formatEntryBatchLabel } from "@/features/admission-config/tabs/admission-cycle/utils/admissionCycleDisplay";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { DataLoader } from "@/shared/ui/DataLoader";
import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Spin,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useCandidateBioDataPage } from "../hooks/useCandidateBioDataPage";
import {
  emailRules,
  firstNameRules,
  lastNameRules,
  phoneRules,
} from "../utils/validators";

const { Title, Paragraph } = Typography;

export function CandidateBioDataPage() {
  const { state, actions, form } = useCandidateBioDataPage();
  const {
    candidate,
    isLoading,
    isError,
    isCandidate,
    isJambLocked,
    isSaving,
    initialValues,
  } = state;
  const { handleSubmit, refetch } = actions;

  if (!isCandidate) {
    return (
      <Card style={{ maxWidth: 720, margin: "0 auto" }}>
        <Title level={3}>Bio Data</Title>
        <Paragraph type="secondary">
          This page is available to admission candidates only.
        </Paragraph>
      </Card>
    );
  }

  const formKey = candidate?.id ?? "loading";

  return (
    <div style={{ maxWidth: 720, margin: "0 auto" }}>
      <Title level={2} style={{ marginBottom: 16 }}>
        Bio Data
      </Title>

      <DataLoader loading={isLoading} loader={<Spin />}>
        {isError ? (
          <ErrorAlert
            variant="section"
            error="Failed to load your admission profile."
            onRetry={refetch}
          />
        ) : null}

        {candidate ? (
          <>
            <Descriptions
              bordered
              size="small"
              column={1}
              style={{ marginBottom: 24 }}
            >
              <Descriptions.Item label="Admission cycle">
                {candidate.cycle?.name ?? `Cycle #${candidate.cycleId}`}
              </Descriptions.Item>
              {candidate.cycle?.entryMode !== undefined &&
              candidate.cycle.batchNo !== undefined ? (
                <Descriptions.Item label="Entry & batch">
                  {formatEntryBatchLabel(
                    candidate.cycle.entryMode,
                    candidate.cycle.batchNo,
                  )}
                </Descriptions.Item>
              ) : null}
              {candidate.jambRegNo ? (
                <Descriptions.Item label="JAMB registration">
                  {candidate.jambRegNo}
                </Descriptions.Item>
              ) : null}
              <Descriptions.Item label="State">
                {candidate.state?.name ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="LGA">
                {candidate.lga?.name ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Applied program">
                {candidate.application?.appliedProgram?.name ?? "—"}
              </Descriptions.Item>
            </Descriptions>

            {isJambLocked ? (
              <Alert
                type="info"
                showIcon
                message="CAPS-locked names"
                description="Your first and last name are locked to your JAMB/CAPS record and cannot be changed here."
                style={{ marginBottom: 24 }}
              />
            ) : null}

            <Card>
              <Form
                key={formKey}
                form={form}
                layout="vertical"
                requiredMark={false}
                initialValues={initialValues}
                onFinish={handleSubmit}
              >
                <Form.Item
                  name="firstName"
                  label="First name"
                  rules={isJambLocked ? [] : firstNameRules}
                >
                  <Input disabled={isJambLocked} />
                </Form.Item>
                <Form.Item
                  name="lastName"
                  label="Last name"
                  rules={isJambLocked ? [] : lastNameRules}
                >
                  <Input disabled={isJambLocked} />
                </Form.Item>
                <Form.Item name="email" label="Email" rules={emailRules}>
                  <Input type="email" />
                </Form.Item>
                <Form.Item name="phone" label="Phone" rules={phoneRules}>
                  <Input placeholder="Optional" />
                </Form.Item>
                <Form.Item
                  name="dateOfBirth"
                  label="Date of birth"
                  getValueFromEvent={(value) => value ?? null}
                  getValueProps={(value) => ({
                    value: value ? dayjs(value) : undefined,
                  })}
                >
                  <DatePicker
                    style={{ width: "100%" }}
                    disabled={isJambLocked}
                  />
                </Form.Item>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    loading={isSaving}
                    disabled={isSaving}
                  >
                    Save changes
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </>
        ) : null}
      </DataLoader>
    </div>
  );
}
