import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, DatePicker, Form, Modal, Select, Switch } from "antd";
import { useSemesterFormModal } from "../../hooks/useSemesterModal";
import type { Semester, SemesterType } from "../../types/academic-calendar";
import { semesterTypeIdRules } from "../../utils/validators";

export type SemesterFormModalProps = {
  open: boolean;
  target: Semester | null;
  sessionId: number | null;
  semesterTypes: SemesterType[];
  onClose: () => void;
};

export function SemesterFormModal({
  open,
  target,
  sessionId,
  semesterTypes,
  onClose,
}: SemesterFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useSemesterFormModal(target, sessionId, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  return (
    <Modal
      title={isEditMode ? "Edit Semester" : "Add Semester"}
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
          <Form.Item name="semesterTypeId" label="Semester Type" rules={semesterTypeIdRules}>
            <Select
              placeholder="Select a semester type"
              style={{ height: 40 }}
              options={semesterTypes.map((st) => ({ value: st.id, label: st.name }))}
            />
          </Form.Item>

          {isEditMode && (
            <>
              <Form.Item name="startDate" label="Start Date">
                <DatePicker style={{ width: "100%", height: 40 }} />
              </Form.Item>

              <Form.Item name="endDate" label="End Date">
                <DatePicker style={{ width: "100%", height: 40 }} />
              </Form.Item>

              <Form.Item name="isCurrent" label="Set as Current" valuePropName="checked">
                <Switch />
              </Form.Item>
            </>
          )}
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
          {isEditMode ? "Save Changes" : "Add Semester"}
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
