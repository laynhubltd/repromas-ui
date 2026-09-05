import { useIsMobile } from "@/hooks/useBreakpoint";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Modal } from "antd";

export interface AddFacultyFormValues {
  code: string;
  name: string;
}

export interface AddFacultyModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: AddFacultyFormValues) => void | Promise<void>;
  loading?: boolean;
}

export function AddFacultyModal({
  open,
  onClose,
  onSubmit,
  loading = false,
}: AddFacultyModalProps) {
  const [form] = Form.useForm<AddFacultyFormValues>();
  const token = useToken();
  const isMobile = useIsMobile();
  const { academicUnit } = useInstitutionTerminology();

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await onSubmit(values);
      form.resetFields();
      onClose();
    } catch {
      // validation or submit error
    }
  };

  const handleCancel = () => {
    form.resetFields();
    onClose();
  };

  return (
    <Modal
      title={academicUnit.addModalTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isMobile ? "100%" : 520}
      style={isMobile ? { maxWidth: "100%", top: 16, paddingBottom: 0 } : undefined}
      destroyOnHidden
      styles={{
        body: { paddingTop: 8, padding: isMobile ? 16 : 24 },
        header: { borderBottom: `1px solid ${token.colorBorderSecondary}` },
      }}
    >
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleOk}
        style={{ marginBottom: 24 }}
      >
        <Form.Item
          name="code"
          label={
            <span>
              {academicUnit.singular} code <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[{ required: true, message: `Please enter ${academicUnit.singular.toLowerCase()} code` }]}
        >
          <Input placeholder={academicUnit.codePlaceholder} />
        </Form.Item>
        <Form.Item
          name="name"
          label={
            <span>
              {academicUnit.singular} name <span style={{ color: token.colorError }}>*</span>
            </span>
          }
          rules={[{ required: true, message: `Please enter ${academicUnit.singular.toLowerCase()} name` }]}
        >
          <Input placeholder={academicUnit.namePlaceholder} />
        </Form.Item>
      </Form>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: 12,
          paddingTop: 16,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
          margin: isMobile ? "0 -16px -16px" : "0 -24px -24px",
          padding: isMobile ? "16px" : "16px 24px 24px",
        }}
      >
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          type="primary"
          loading={loading}
          onClick={() => form.submit()}
        >
          {academicUnit.createButtonLabel}
        </Button>
      </div>
    </Modal>
  );
}
