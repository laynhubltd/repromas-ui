import {
  getCandidateEntryModeLabel,
  isRealJambRegNo,
} from "@/shared/constants/admissionCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex, Modal, Tag, Typography } from "antd";
import { useMatriculateAdmissionCandidateModal } from "../../hooks/useAdmissionCandidateModal";
import type { AdmissionCandidate } from "../../types/admission-candidate";

type MatriculateAdmissionCandidateModalProps = {
  open: boolean;
  candidate: AdmissionCandidate | null;
  onClose: () => void;
};

export function MatriculateAdmissionCandidateModal({
  open,
  candidate,
  onClose,
}: MatriculateAdmissionCandidateModalProps) {
  const token = useToken();
  const { state, actions } = useMatriculateAdmissionCandidateModal(
    candidate,
    open,
    onClose,
  );

  return (
    <Modal
      title="Matriculate Candidate"
      open={open}
      onCancel={actions.handleCancel}
      onOk={actions.handleConfirm}
      okText="Confirm Matriculation"
      confirmLoading={state.isLoading}
      destroyOnHidden
    >
      <Flex vertical gap={12}>
        <Flex align="center" gap={8} wrap="wrap">
          <Tag color="blue">
            {getCandidateEntryModeLabel(candidate?.entryMode)}
          </Tag>
        </Flex>
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Matriculate{" "}
          <strong>
            {candidate?.firstName} {candidate?.lastName}
          </strong>
          <ConditionalRenderer when={isRealJambRegNo(candidate?.jambRegNo)}>
            {` (${candidate?.jambRegNo})`}
          </ConditionalRenderer>
          ? This marks the application as matriculated and triggers downstream
          student creation.
        </Typography.Paragraph>
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          Matriculation number generation slot and intake level placement follow
          this candidate&apos;s entry mode.
        </Typography.Text>
      </Flex>
    </Modal>
  );
}
