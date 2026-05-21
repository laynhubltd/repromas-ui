import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, Modal } from "antd";
import { useOlevelSubjectFormModal } from "../../hooks/useOlevelSubjectModal";
import type { OlevelSubject } from "../../types/olevel-subject";
import { codeRules, nameRules } from "../../utils/validators";

type OlevelSubjectFormModalProps = {
  open: boolean;
  target: OlevelSubject | null;
  onClose: () => void;
};

export function OlevelSubjectFormModal({
  open,
  target,
  onClose,
}: OlevelSubjectFormModalProps) {
  const token = useToken();

  const {
    state: { isEditMode, formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  } = useOlevelSubjectFormModal(target, open, onClose);

  return (
    <Modal
      title={isEditMode ? "Edit O'Level Subject" : "Create O'Level Subject"}
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
        <ErrorAlert variant="form" error={formError} />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label={
              <span>
                Subject name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={nameRules}
          >
            <Input
              placeholder="e.g. English Language"
              maxLength={100}
              style={{ height: 40 }}
            />
          </Form.Item>

          <Form.Item name="code" label="Subject code" rules={codeRules}>
            <Input
              placeholder="e.g. ENG (optional)"
              maxLength={20}
              style={{ height: 40 }}
            />
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
        <PermissionGuard
          permission={
            isEditMode
              ? Permission.AdmissionOlevelSubjectsUpdate
              : Permission.AdmissionOlevelSubjectsCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Changes" : "Create Subject"}
          </Button>
        </PermissionGuard>
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
