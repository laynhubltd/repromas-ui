import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  Alert,
  Descriptions,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Typography,
} from "antd";
import { useOfferAdmissionCandidateModal } from "../../hooks/useAdmissionCandidateModal";
import type { AdmissionCandidate } from "../../types/admission-candidate";
import {
  finalDecisionRules,
  offerOverrideReasonRules,
  offeredProgramIdRules,
  seatBucketRules,
} from "../../utils/validators";

type OfferAdmissionCandidateModalProps = {
  open: boolean;
  candidate: AdmissionCandidate | null;
  onClose: () => void;
};

function resolveAppliedProgramLabel(
  candidate: AdmissionCandidate | null,
): string {
  if (!candidate?.application) return "—";
  return (
    candidate.application.appliedProgram?.name ??
    String(candidate.application.appliedProgramId)
  );
}

export function OfferAdmissionCandidateModal({
  open,
  candidate,
  onClose,
}: OfferAdmissionCandidateModalProps) {
  const token = useToken();
  const { state, actions, form } = useOfferAdmissionCandidateModal(
    candidate,
    open,
    onClose,
  );

  return (
    <Modal
      title="Offer Admission"
      open={open}
      onCancel={actions.handleCancel}
      onOk={actions.handleConfirm}
      okText="Confirm Offer"
      confirmLoading={state.isLoading}
      destroyOnHidden
      afterOpenChange={(visible) => {
        if (visible) actions.initForm();
      }}
    >
      <Flex vertical gap={16}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Commit an admission decision for{" "}
          <Typography.Text strong>
            {candidate?.firstName} {candidate?.lastName}
          </Typography.Text>
          {candidate?.jambRegNo ? ` (${candidate.jambRegNo})` : null}.
        </Typography.Paragraph>

        <Alert
          type="warning"
          showIcon
          message="Seat availability is evaluated at commit time. A 409 response means the bucket is exhausted — refresh and retry."
        />

        <Descriptions
          bordered
          size="small"
          column={1}
          styles={{
            label: { width: 160, color: token.colorTextSecondary },
          }}
        >
          <Descriptions.Item label="Applied program">
            {resolveAppliedProgramLabel(candidate)}
          </Descriptions.Item>
          <Descriptions.Item label="Aggregate score">
            {candidate?.screening?.aggregateScore ?? "—"}
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item
            name="finalDecision"
            label="Final decision"
            rules={finalDecisionRules}
          >
            <Select
              placeholder="Select decision"
              options={state.decisionOptions}
              onChange={() => {
                form.setFieldsValue({
                  offeredProgramId: undefined,
                  seatBucket: undefined,
                });
              }}
            />
          </Form.Item>

          <ConditionalRenderer when={state.isChangeOfCourse}>
            <Form.Item
              name="offeredProgramId"
              label="Offered program"
              rules={offeredProgramIdRules}
            >
              <Select
                placeholder="Select alternative program"
                showSearch
                optionFilterProp="label"
                loading={state.isProgramsLoading}
                options={state.programOptions}
              />
            </Form.Item>
            <Form.Item
              name="seatBucket"
              label="Seat bucket"
              rules={seatBucketRules}
            >
              <Select
                placeholder="Select quota bucket"
                options={state.seatBucketOptions}
              />
            </Form.Item>
          </ConditionalRenderer>

          <Form.Item
            name="overrideReason"
            label="Reason"
            rules={offerOverrideReasonRules}
            extra="Required for manual offers from the candidate list."
          >
            <Input.TextArea
              rows={3}
              placeholder="Document why this decision is being committed"
              maxLength={500}
              showCount
            />
          </Form.Item>
        </Form>
      </Flex>
    </Modal>
  );
}
