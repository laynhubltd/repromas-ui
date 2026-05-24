import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { FEE_ITEM_TOOLTIPS } from "@/shared/constants/feeItemOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, Input, Modal, Switch, Tooltip } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import { useFeeItemFormModal } from "../../hooks/useFeeItemModal";
import type { FeeItem } from "../../types/fee-item";
import {
  accountingCodeRules,
  descriptionRules,
  nameRules,
} from "../../utils/validators";

type FeeItemFormModalProps = {
  open: boolean;
  target: FeeItem | null;
  onClose: () => void;
};

function LabelWithTooltip({
  label,
  tooltip,
  required,
}: {
  label: string;
  tooltip: string;
  required?: boolean;
}) {
  const token = useToken();
  return (
    <span>
      {label}
      {required ? (
        <span style={{ color: token.colorError, fontWeight: 700 }}> *</span>
      ) : null}{" "}
      <Tooltip title={tooltip}>
        <QuestionCircleOutlined
          style={{ color: token.colorTextTertiary, fontSize: token.fontSizeSM }}
        />
      </Tooltip>
    </span>
  );
}

export function FeeItemFormModal({
  open,
  target,
  onClose,
}: FeeItemFormModalProps) {
  const token = useToken();

  const {
    state: { isEditMode, formError, isSubmitting },
    actions: { handleSubmit, handleCancel },
    form,
  } = useFeeItemFormModal(target, open, onClose);

  return (
    <Modal
      title={isEditMode ? "Edit Fee Item" : "Create Fee Item"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
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
              <LabelWithTooltip
                label="Name"
                tooltip={FEE_ITEM_TOOLTIPS.name}
                required
              />
            }
            rules={nameRules}
          >
            <Input placeholder="e.g. Application Fee" maxLength={150} style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="accountingCode"
            label={
              <LabelWithTooltip
                label="Accounting code"
                tooltip={FEE_ITEM_TOOLTIPS.accountingCode}
              />
            }
            rules={accountingCodeRules}
          >
            <Input placeholder="e.g. ADM-APP-FEE" maxLength={64} style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="description"
            label={
              <LabelWithTooltip
                label="Description"
                tooltip={FEE_ITEM_TOOLTIPS.description}
              />
            }
            rules={descriptionRules}
          >
            <Input.TextArea
              placeholder="Optional internal note"
              rows={3}
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="isActive"
            label={
              <LabelWithTooltip label="Active" tooltip={FEE_ITEM_TOOLTIPS.isActive} />
            }
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <PermissionGuard
            permission={
              isEditMode
                ? Permission.BillingFeeItemsUpdate
                : Permission.BillingFeeItemsCreate
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
              {isEditMode ? "Save Changes" : "Create Fee Item"}
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
