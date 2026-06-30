import { getRecommenderReasonLabel } from "@/shared/constants/admissionRecommenderOptions";
import {
  getQuotaCategoryLabel,
  getRecommendedDecisionLabel,
} from "@/shared/constants/admissionRecommendedCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
    Alert,
    Checkbox,
    Descriptions,
    Flex,
    Form,
    Input,
    Modal,
    Tag,
    Typography,
} from "antd";
import { useRecommendedCandidateOfferModal } from "../../hooks/useRecommendedCandidateModal";
import type { AdmissionRecommendedCandidate } from "../../types/admission-recommended-candidate";
import { recommendedDecisionTagColor } from "../../utiles/recommendationDisplay";
import { overrideReasonRules } from "../../utiles/validators";

type OfferRecommendedCandidateModalProps = {
  open: boolean;
  target: AdmissionRecommendedCandidate | null;
  onClose: () => void;
};

function resolveProgramLabel(
  program: { name: string } | undefined,
  programId: number | null | undefined,
): string {
  if (program?.name) return program.name;
  if (programId != null) return `Program #${programId}`;
  return "—";
}

export function OfferRecommendedCandidateModal({
  open,
  target,
  onClose,
}: OfferRecommendedCandidateModalProps) {
  const token = useToken();
  const { state, actions, form } = useRecommendedCandidateOfferModal(
    target,
    open,
    onClose,
  );

  const manualOverride = Form.useWatch("manualOverride", form) === true;
  const isChangeOfCourse =
    target?.recommendedDecision === "OFFER_CHANGE_OF_COURSE";

  return (
    <Modal
      title="Confirm Offer"
      open={open}
      onCancel={actions.handleCancel}
      onOk={actions.handleConfirm}
      okText="Confirm Offer"
      confirmLoading={state.isLoading}
      destroyOnHidden
      afterOpenChange={(visible) => {
        if (visible) {
          form.resetFields();
          form.setFieldsValue({ manualOverride: false });
        }
      }}
    >
      <Flex vertical gap={16}>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Commit the recommended outcome for{" "}
          <Typography.Text strong>
            {target?.firstName} {target?.lastName}
          </Typography.Text>
          ?
        </Typography.Paragraph>

        <Alert
          type="warning"
          showIcon
          message="Seats are not reserved on this list. Another officer may consume slots before you confirm — a 409 at commit time means you should refresh and retry."
        />

        <Descriptions
          bordered
          size="small"
          column={1}
          styles={{
            label: { width: 160, color: token.colorTextSecondary },
          }}
        >
          <Descriptions.Item label="Aggregate score">
            {target?.aggregateScore ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Quota category">
            {getQuotaCategoryLabel(target?.quotaCategory)}
          </Descriptions.Item>
          <Descriptions.Item label="Recommendation">
            {target != null && (
              <Tag
                color={recommendedDecisionTagColor(target.recommendedDecision)}
              >
                {getRecommendedDecisionLabel(target.recommendedDecision)}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Applied program">
            {resolveProgramLabel(
              target?.appliedProgram,
              target?.appliedProgramId,
            )}
          </Descriptions.Item>
          <ConditionalRenderer when={isChangeOfCourse}>
            <Descriptions.Item label="Proposed program">
              {resolveProgramLabel(
                target?.recommendedOfferedProgram,
                target?.recommendedOfferedProgramId,
              )}
            </Descriptions.Item>
          </ConditionalRenderer>
          <Descriptions.Item label="Reason">
            {getRecommenderReasonLabel(target?.reasonCode)}
          </Descriptions.Item>
        </Descriptions>

        <Form form={form} layout="vertical" requiredMark={false}>
          <Form.Item name="manualOverride" valuePropName="checked">
            <Checkbox>
              Manual override (use a different decision than recommended)
            </Checkbox>
          </Form.Item>

          <ConditionalRenderer when={manualOverride}>
            <Form.Item
              name="overrideReason"
              label="Override reason"
              rules={overrideReasonRules}
            >
              <Input.TextArea
                rows={3}
                placeholder="Explain why this offer differs from the recommendation"
                maxLength={500}
                showCount
              />
            </Form.Item>
          </ConditionalRenderer>
        </Form>
      </Flex>
    </Modal>
  );
}
