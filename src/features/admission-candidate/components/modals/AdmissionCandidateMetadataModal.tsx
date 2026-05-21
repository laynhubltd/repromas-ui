import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Form, Input, Modal } from "antd";
import { useEffect } from "react";
import { useAdmissionCandidateMetadataModal } from "../../hooks/useAdmissionCandidateModal";
import { metadataJsonRules } from "../../utils/validators";

type AdmissionCandidateMetadataModalProps = {
  open: boolean;
  candidateId: number | null;
  onClose: () => void;
};

export function AdmissionCandidateMetadataModal({
  open,
  candidateId,
  onClose,
}: AdmissionCandidateMetadataModalProps) {
  const token = useToken();
  const { state, actions, form } = useAdmissionCandidateMetadataModal(
    candidateId,
    open,
    onClose,
  );

  useEffect(() => {
    if (open) actions.initForm();
  }, [open, actions, state.candidate]);

  return (
    <Modal
      title="Edit Candidate Metadata"
      open={open}
      onCancel={actions.handleCancel}
      onOk={actions.handleSubmit}
      okText="Save"
      confirmLoading={state.isLoading}
      width={520}
      destroyOnHidden
    >
      <Form form={form} layout="vertical" style={{ marginTop: token.paddingMD }}>
        <ErrorAlert error={state.formError} />
        <Form.Item
          name="metadataJson"
          label="Metadata (JSON)"
          rules={metadataJsonRules}
          extra="Set to empty to clear metadata."
        >
          <Input.TextArea rows={8} />
        </Form.Item>
      </Form>
    </Modal>
  );
}
