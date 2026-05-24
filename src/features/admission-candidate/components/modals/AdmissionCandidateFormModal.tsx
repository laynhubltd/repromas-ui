import { useToken } from "@/shared/hooks/useToken";
import {
  CANDIDATE_GENDER_FORM_OPTIONS,
} from "@/shared/constants/admissionCandidateOptions";
import { DatePicker, Form, Input, Modal, Select } from "antd";
import { useEffect } from "react";
import { useAdmissionCandidateFormModal } from "../../hooks/useAdmissionCandidateModal";
import {
  cycleIdRules,
  emailRules,
  firstNameRules,
  jambRegNoRules,
  lastNameRules,
  metadataJsonRules,
  stateIdRules,
} from "../../utils/validators";

type AdmissionCandidateFormModalProps = {
  open: boolean;
  defaultCycleId: number | undefined;
  canIngest: boolean;
  onClose: () => void;
};

export function AdmissionCandidateFormModal({
  open,
  defaultCycleId,
  canIngest,
  onClose,
}: AdmissionCandidateFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useAdmissionCandidateFormModal(
    open,
    defaultCycleId,
    canIngest,
    onClose,
  );

  useEffect(() => {
    if (open) actions.initForm();
  }, [open, actions]);

  return (
    <Modal
      title="Create Admission Candidate"
      open={open}
      onCancel={actions.handleCancel}
      onOk={actions.handleSubmit}
      okText="Create"
      confirmLoading={state.isLoading}
      width={640}
      destroyOnHidden
      okButtonProps={{ disabled: !canIngest }}
    >
      <Form form={form} layout="vertical" style={{ marginTop: token.paddingMD }}>
        <Form.Item name="cycleId" label="Admission Cycle" rules={cycleIdRules}>
          <Select
            placeholder="Select cycle"
            options={state.cycles.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.status})`,
            }))}
          />
        </Form.Item>
        <Form.Item name="jambRegNo" label="JAMB Reg. No." rules={jambRegNoRules}>
          <Input placeholder="202655999999AA" />
        </Form.Item>
        <Form.Item name="firstName" label="First Name" rules={firstNameRules}>
          <Input />
        </Form.Item>
        <Form.Item name="lastName" label="Last Name" rules={lastNameRules}>
          <Input />
        </Form.Item>
        <Form.Item name="dateOfBirth" label="Date of Birth">
          <DatePicker style={{ width: "100%" }} />
        </Form.Item>
        <Form.Item name="gender" label="Gender">
          <Select
            allowClear
            placeholder="Select gender"
            options={CANDIDATE_GENDER_FORM_OPTIONS}
          />
        </Form.Item>
        <Form.Item name="stateId" label="State" rules={stateIdRules}>
          <Select
            showSearch
            optionFilterProp="label"
            placeholder="Select state"
            options={state.states.map((s) => ({
              value: s.id,
              label: s.name,
            }))}
          />
        </Form.Item>
        <Form.Item name="email" label="Email" rules={emailRules}>
          <Input type="email" />
        </Form.Item>
        <Form.Item name="phone" label="Phone">
          <Input />
        </Form.Item>
        <Form.Item
          name="metadataJson"
          label="Metadata (JSON)"
          rules={metadataJsonRules}
        >
          <Input.TextArea rows={3} placeholder='{"source":"manual"}' />
        </Form.Item>
      </Form>
    </Modal>
  );
}
