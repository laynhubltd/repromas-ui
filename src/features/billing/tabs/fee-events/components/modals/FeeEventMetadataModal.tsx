import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { FEE_EVENT_TOOLTIPS } from "@/shared/constants/feeEventOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Form, Input, Modal, Switch } from "antd";
import type { BillableEvent } from "../../types/billable-event";
import { useFeeEventMetadataModal } from "../../hooks/useFeeEventMetadataModal";
import { nameRules } from "../../utils/validators";

type FeeEventMetadataModalProps = {
  open: boolean;
  target: BillableEvent | null;
  onClose: () => void;
};

export function FeeEventMetadataModal({
  open,
  target,
  onClose,
}: FeeEventMetadataModalProps) {
  const token = useToken();
  const {
    state: { isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  } = useFeeEventMetadataModal(target, open, onClose);

  return (
    <Modal
      title="Edit fee event"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={560}
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
        <Alert
          type="info"
          showIcon
          message="Fee event details only. View or change billing rules on the Fee Policy tab."
          style={{ marginBottom: 16 }}
        />

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <Form.Item label="Fee type" tooltip={FEE_EVENT_TOOLTIPS.feeType}>
            <Input value={target?.code} disabled />
          </Form.Item>

          <Form.Item
            name="name"
            label="Name shown to staff"
            tooltip={FEE_EVENT_TOOLTIPS.displayName}
            rules={nameRules}
          >
            <Input placeholder="Application Fee" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            tooltip={FEE_EVENT_TOOLTIPS.description}
          >
            <Input.TextArea
              rows={2}
              placeholder="Optional admin note"
              maxLength={500}
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label="Active"
            tooltip={FEE_EVENT_TOOLTIPS.activeStatus}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 8,
            }}
          >
            <Button onClick={handleCancel} disabled={isSubmitting}>
              Cancel
            </Button>
            <PermissionGuard
              permission={Permission.BillingBillableEventsUpdate}
            >
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Save changes
              </Button>
            </PermissionGuard>
          </div>
        </Form>
      </div>
    </Modal>
  );
}
