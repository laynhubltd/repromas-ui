import { MATRIC_FORMAT_SLOT_OPTIONS, matricSlotKey } from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { Button, Form, Input, Modal, Radio } from "antd";
import { useCreateMatricNumberFormatModal } from "../../hooks/useMatricNumberFormatModal";
import type { MatricFormatSlot, MatricNumberFormat } from "../../types/matric-number-format";
import { entryModeRules, formatCodeRules } from "../../utils/validators";

type CreateMatricNumberFormatModalProps = {
  open: boolean;
  initialEntryMode: MatricFormatSlot | undefined;
  lanePresetLocked: boolean;
  onClose: () => void;
  onCreated: (format: MatricNumberFormat) => void;
};

export function CreateMatricNumberFormatModal({
  open,
  initialEntryMode,
  lanePresetLocked,
  onClose,
  onCreated,
}: CreateMatricNumberFormatModalProps) {
  const token = useToken();
  const { state, actions, form } = useCreateMatricNumberFormatModal(
    open,
    initialEntryMode,
    lanePresetLocked,
    onClose,
    onCreated,
  );
  const { isLoading, defaultEntryModeKey } = state;
  const { handleSubmit, handleCancel } = actions;

  const slotOptions = MATRIC_FORMAT_SLOT_OPTIONS.map((option) => ({
    value: matricSlotKey(option.value),
    label: option.label,
  }));

  return (
    <Modal
      title="Create Matric Number Format"
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
          initialValues={{ entryMode: defaultEntryModeKey, code: "" }}
          key={`create-${defaultEntryModeKey}-${open ? "open" : "closed"}`}
        >
          <Form.Item
            name="entryMode"
            label={
              <span>
                Lane / slot <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={entryModeRules}
            extra="Which admission lane this format serves. Default is the fallback when no lane-specific format is live."
          >
            <Radio.Group disabled={lanePresetLocked}>
              {slotOptions.map((option) => (
                <Radio key={option.value} value={option.value} style={{ display: "block", marginBottom: 8 }}>
                  {option.label}
                </Radio>
              ))}
            </Radio.Group>
          </Form.Item>
          <Form.Item
            name="code"
            label={
              <span>
                Format code <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={formatCodeRules}
            extra="Admin label for this format version (unique per tenant)."
          >
            <Input placeholder="e.g. session-reg" style={{ height: 40 }} />
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
          Create Draft
        </Button>
        <Button type="text" block onClick={handleCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
