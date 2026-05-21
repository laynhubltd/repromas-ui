import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Modal, Typography } from "antd";
import { useOfferAdmissionCandidateModal } from "../../hooks/useAdmissionCandidateModal";
import type { AdmissionCandidate } from "../../types/admission-candidate";

type OfferAdmissionCandidateModalProps = {
  open: boolean;
  candidate: AdmissionCandidate | null;
  onClose: () => void;
};

export function OfferAdmissionCandidateModal({
  open,
  candidate,
  onClose,
}: OfferAdmissionCandidateModalProps) {
  const { state, actions } = useOfferAdmissionCandidateModal(
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
    >
      <ErrorAlert error={state.error} />
      <Typography.Paragraph>
        Run the offer process for{" "}
        <strong>
          {candidate?.firstName} {candidate?.lastName}
        </strong>{" "}
        ({candidate?.jambRegNo})? This evaluates quota rules and updates the
        final decision.
      </Typography.Paragraph>
    </Modal>
  );
}
