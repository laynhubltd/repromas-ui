import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, InputNumber, Modal } from "antd";
import { useOlevelGradePointFormModal } from "../../hooks/useOlevelGradePointModal";
import type { OlevelGradePoint } from "../../types/olevel-grade-point";
import { gradeRules, pointsRules } from "../../utils/validators";

type OlevelGradePointFormModalProps = {
  open: boolean;
  target: OlevelGradePoint | null;
  onClose: () => void;
};

export function OlevelGradePointFormModal({
  open,
  target,
  onClose,
}: OlevelGradePointFormModalProps) {
  const token = useToken();

  const {
    state: { isEditMode, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  } = useOlevelGradePointFormModal(target, open, onClose);

  return (
    <Modal
      title={isEditMode ? "Edit Grade Mapping" : "Create Grade Mapping"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={480}
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
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="grade"
            label={
              <span>
                Grade label{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={gradeRules}
            extra="Stored as uppercase (e.g. A1, B2). Must be unique per tenant."
          >
            <Input
              placeholder="e.g. A1"
              maxLength={10}
              style={{ height: 40, textTransform: "uppercase" }}
            />
          </Form.Item>

          <Form.Item
            name="points"
            label={
              <span>
                Points{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={pointsRules}
          >
            <InputNumber
              min={0}
              precision={0}
              placeholder="e.g. 6"
              style={{ width: "100%", height: 40 }}
            />
          </Form.Item>

          <PermissionGuard
            permission={
              isEditMode
                ? Permission.AdmissionOlevelGradePointsUpdate
                : Permission.AdmissionOlevelGradePointsCreate
            }
          >
            <Button
              type="primary"
              htmlType="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              block
              style={{ height: 48, fontWeight: 600, marginTop: 8 }}
            >
              {isEditMode ? "Save Changes" : "Create Mapping"}
            </Button>
          </PermissionGuard>
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
          type="text"
          block
          onClick={handleCancel}
          disabled={isSubmitting}
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
