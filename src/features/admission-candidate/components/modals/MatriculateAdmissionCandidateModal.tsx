import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Modal, Typography } from "antd";
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
      <ErrorAlert error={state.error} />
      <Typography.Paragraph>
        Matriculate{" "}
        <strong>
          {candidate?.firstName} {candidate?.lastName}
        </strong>{" "}
        ({candidate?.jambRegNo})? This marks the application as matriculated and
        triggers downstream student creation.
      </Typography.Paragraph>
    </Modal>
  );
}
