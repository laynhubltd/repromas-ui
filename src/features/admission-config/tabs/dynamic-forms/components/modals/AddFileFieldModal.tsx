import { useAddFileFieldModal } from "../../hooks/useAddFileFieldModal";
import { fieldLabelRules } from "../../utils/validators";
import { useToken } from "@/shared/hooks/useToken";
import { Form, Input, Modal, Select, Switch, Typography } from "antd";

type AddFileFieldModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (fieldKey: string, label: string, isRequired: boolean) => Promise<void>;
  isAdding: boolean;
};

export function AddFileFieldModal({
  open,
  onClose,
  onAdd,
  isAdding,
}: AddFileFieldModalProps) {
  const token = useToken();
  const { form, state, actions } = useAddFileFieldModal({ open, onAdd, onClose });

  return (
    <Modal
      open={open}
      title="Add document field"
      onOk={actions.handleOk}
      onCancel={actions.handleCancel}
      okText="Add field"
      confirmLoading={isAdding}
    >
      <Typography.Paragraph type="secondary" style={{ marginBottom: 16 }}>
        Pick a document type from your catalog. The field key is set
        automatically from the type code — no manual entry needed.
      </Typography.Paragraph>

      <Form form={form} layout="vertical">

        {/* Document type picker — drives fieldKey automatically */}
        <Form.Item
          name="documentTypeId"
          label="Document type"
          rules={[{ required: true, message: "Select a document type" }]}
          tooltip="Only active document types are shown. Manage types in Admission Config → Document Types."
        >
          <Select
            placeholder="Select document type…"
            loading={state.isLoadingTypes}
            options={state.typeOptions}
            showSearch
            filterOption={(input, option) =>
              String(option?.label ?? "")
                .toLowerCase()
                .includes(input.toLowerCase())
            }
            onSelect={actions.handleTypeSelect}
            notFoundContent={
              state.isLoadingTypes
                ? "Loading…"
                : "No active document types. Add one in Admission Config → Document Types."
            }
          />
        </Form.Item>

        {/* Resolved fieldKey + validation constraints — read-only info */}
        <Form.Item noStyle shouldUpdate>
          {() => {
            const selectedId = form.getFieldValue("documentTypeId") as
              | number
              | undefined;
            const selected = state.typeOptions.find(
              (o) => o.value === selectedId,
            );
            if (!selected) return null;
            return (
              <Typography.Paragraph
                type="secondary"
                style={{ fontSize: token.fontSizeSM, marginBottom: 16 }}
              >
                Field key:{" "}
                <Typography.Text code>{selected.docType.code}</Typography.Text>
                {" · "}
                Accepted:{" "}
                <Typography.Text code>
                  {selected.docType.mimeTypes.join(", ")}
                </Typography.Text>
                {" · "}
                Max{" "}
                <Typography.Text code>
                  {selected.docType.maxSizeMb} MB
                </Typography.Text>
              </Typography.Paragraph>
            );
          }}
        </Form.Item>

        {/* Label — pre-filled from type name, editable */}
        <Form.Item
          name="label"
          label="Label"
          rules={fieldLabelRules}
          tooltip="Pre-filled from the document type name. You can customise it for this form."
        >
          <Input placeholder="Select a document type first" />
        </Form.Item>

        {/* Required toggle */}
        <Form.Item
          name="isRequired"
          label="Required"
          valuePropName="checked"
          initialValue={true}
        >
          <Switch />
        </Form.Item>

      </Form>
    </Modal>
  );
}
