import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useSemesterTypeFormModal } from "../../hooks/useSemesterTypeModal";
import type { SemesterType } from "../../types/academic-calendar";
import {
    semesterTypeCodeRules,
    semesterTypeNameRules,
    semesterTypeSortOrderRules,
} from "../../utils/validators";

export type SemesterTypeFormModalProps = {
  open: boolean;
  target: SemesterType | null;
  onClose: () => void;
};

export function SemesterTypeFormModal({ open, target, onClose }: SemesterTypeFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useSemesterTypeFormModal(target, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Semester Type" : "Create Semester Type"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width="100%"
      style={{ maxWidth: 480 }}
      destroyOnHidden
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <ErrorAlert variant="form" error={formError} />

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <Form.Item name="name" label="Name" rules={semesterTypeNameRules}>
            <Input placeholder="e.g. First Semester" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item name="code" label="Code" rules={semesterTypeCodeRules}>
            <Input placeholder="e.g. SEM1" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item name="sortOrder" label="Sort Order" rules={semesterTypeSortOrderRules}>
            <InputNumber placeholder="e.g. 1" min={1} style={{ width: "100%", height: 40 }} />
          </Form.Item>
        </Form>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Create Semester Type"}
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
