import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { useToken } from "@/shared/hooks/useToken";
import {
  InboxOutlined,
  ReloadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Button,
  Checkbox,
  Flex,
  Form,
  Image,
  Input,
  InputNumber,
  Modal,
  Select,
  Steps,
  Switch,
  Typography,
  Upload,
} from "antd";
import type { UploadFile } from "antd";
import { useCallback, useState } from "react";
import type { SignatoryStep2Values, useSignatoriesConfig } from "../../hooks/useSignatoriesConfig";
import { APPLY_TO_OPTIONS, SIGNATURE_ACCEPT_ATTRIBUTE } from "../../types/signatories";
import {
  signatoryNameRules,
  signatoryOrderRules,
  signatoryPositionRules,
  signatoryQualificationRules,
  signatoryTitleRules,
} from "../../utils/validators";

type SignatoriesController = ReturnType<typeof useSignatoriesConfig>;

export type SignatoriesConfigModalProps = {
  open: boolean;
  onClose: () => void;
  state: SignatoriesController["state"];
  actions: SignatoriesController["actions"];
  flags: SignatoriesController["flags"];
};

// ── Step 1 ────────────────────────────────────────────────────────────────────

type Step1FormValues = {
  userId: number;
  roleId: number;
};

type StepProps = {
  state: SignatoriesController["state"];
  actions: SignatoriesController["actions"];
  flags: SignatoriesController["flags"];
  onClose: () => void;
};

/**
 * Step1 remounts via `key` every time the modal opens or the edit target
 * changes, so initialValues are applied fresh without any useEffect.
 */
function SignatoryStep1({ state, actions, flags, onClose }: StepProps) {
  const token = useToken();

  const step1InitialValues: Partial<Step1FormValues> =
    flags.isEditMode && state.editTarget
      ? { userId: state.editTarget.userId, roleId: state.editTarget.roleId }
      : {};

  const [form] = Form.useForm<Step1FormValues>();
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [fileError, setFileError] = useState<string | null>(null);

  const handleUpload = useCallback(async () => {
    try {
      const values = await form.validateFields();
      if (fileList.length === 0) {
        setFileError("Please select a signature image.");
        return;
      }
      setFileError(null);
      const file = fileList[0].originFileObj as File;
      await actions.handleUploadSignature(file, values.userId, values.roleId);
    } catch {
      // antd validation — inline errors shown by the Form
    }
  }, [form, fileList, actions]);

  const handleSkip = useCallback(() => {
    actions.handleSkipUpload();
  }, [actions]);

  return (
    <Form
      form={form}
      layout="vertical"
      size="middle"
      initialValues={step1InitialValues}
    >
      <Form.Item
        name="userId"
        label="User"
        rules={[{ required: true, message: "Please select a user." }]}
      >
        <Select
          showSearch
          filterOption={(input, opt) =>
            String(opt?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          placeholder="Select user"
          loading={state.isDatasourceLoading}
          options={state.userOptions}
          style={{ width: "100%" }}
          suffixIcon={<UserOutlined />}
          disabled={flags.isEditMode}
        />
      </Form.Item>

      <Form.Item
        name="roleId"
        label="Role"
        rules={[{ required: true, message: "Please select a role." }]}
      >
        <Select
          showSearch
          filterOption={(input, opt) =>
            String(opt?.label ?? "").toLowerCase().includes(input.toLowerCase())
          }
          placeholder="Select role"
          loading={state.isDatasourceLoading}
          options={state.roleOptions}
          style={{ width: "100%" }}
          disabled={flags.isEditMode}
        />
      </Form.Item>

      <Form.Item
        label="Signature Image"
        extra="PNG or JPEG only. Max 5 MB."
        validateStatus={fileError ? "error" : undefined}
        help={fileError ?? undefined}
      >
        <Upload.Dragger
          accept={SIGNATURE_ACCEPT_ATTRIBUTE}
          maxCount={1}
          fileList={fileList}
          beforeUpload={() => false}
          onChange={({ fileList: next }) => setFileList(next)}
          style={{
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          }}
        >
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag to upload signature</p>
          <p className="ant-upload-hint">PNG or JPEG only</p>
        </Upload.Dragger>
      </Form.Item>

      <ConditionalRenderer when={flags.isEditMode && !!state.editTarget?.publicUrl}>
        <div
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: 12,
            marginBottom: 16,
            background: token.colorBgLayout,
          }}
        >
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 8 }}
          >
            Current signature
          </Typography.Text>
          <Image
            src={state.editTarget?.publicUrl}
            alt="Current signature"
            height={80}
            style={{ objectFit: "contain" }}
            preview={false}
          />
        </div>
      </ConditionalRenderer>

      <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
        <Button onClick={onClose}>Cancel</Button>

        <ConditionalRenderer when={flags.isEditMode}>
          <Button
            icon={<ReloadOutlined />}
            onClick={handleSkip}
            disabled={state.isUploadingSignature}
          >
            Keep existing signature
          </Button>
        </ConditionalRenderer>

        <Button
          type="primary"
          loading={state.isUploadingSignature}
          onClick={() => void handleUpload()}
        >
          {flags.isEditMode ? "Re-upload & Continue" : "Upload Signature"}
        </Button>
      </Flex>
    </Form>
  );
}

// ── Step 2 ────────────────────────────────────────────────────────────────────

/**
 * Step2 also remounts via `key` when the modal opens, so initialValues are
 * applied fresh without any useEffect.
 */
function SignatoryStep2({ state, actions, flags, onClose }: StepProps) {
  const token = useToken();

  const step2InitialValues: Partial<SignatoryStep2Values> =
    flags.isEditMode && state.editTarget
      ? {
          name: state.editTarget.name,
          position: state.editTarget.position,
          qualification: state.editTarget.qualification,
          title: state.editTarget.title,
          applyTo: state.editTarget.applyTo,
          order: state.editTarget.order,
          isActive: state.editTarget.isActive,
        }
      : {
          name: "",
          position: "",
          qualification: "",
          title: "",
          applyTo: [],
          order: state.localList.length + 1,
          isActive: true,
        };

  const [form] = Form.useForm<SignatoryStep2Values>();

  const handleCommit = useCallback(async () => {
    try {
      const values = await form.validateFields();
      actions.handleCommitEntry(values);
    } catch {
      // antd validation — inline errors shown by the Form
    }
  }, [form, actions]);

  const previewUrl =
    state.step1Result?.publicUrl ?? state.editTarget?.publicUrl ?? null;

  const userLabel =
    state.step1Result
      ? (state.userOptions.find((o) => o.value === state.step1Result!.userId)?.label ??
        `User #${state.step1Result.userId}`)
      : (state.editTarget?.userLabel ?? "");

  const roleLabel =
    state.step1Result
      ? (state.roleOptions.find((o) => o.value === state.step1Result!.roleId)?.label ??
        `Role #${state.step1Result.roleId}`)
      : (state.editTarget?.roleLabel ?? "");

  return (
    <Form
      form={form}
      layout="vertical"
      size="middle"
      initialValues={step2InitialValues}
    >
      {/* Locked user/role display */}
      <Flex gap={12} style={{ marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, display: "block" }}
          >
            User
          </Typography.Text>
          <Typography.Text strong>{userLabel}</Typography.Text>
        </div>
        <div style={{ flex: 1 }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, display: "block" }}
          >
            Role
          </Typography.Text>
          <Typography.Text strong>{roleLabel}</Typography.Text>
        </div>
      </Flex>

      {/* Signature preview */}
      <ConditionalRenderer when={!!previewUrl}>
        <div
          style={{
            border: `1px solid ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            padding: 12,
            marginBottom: 16,
            background: token.colorBgLayout,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <Image
            src={previewUrl ?? undefined}
            alt="Signature preview"
            height={72}
            style={{ objectFit: "contain" }}
            preview={false}
          />
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            Signature image
          </Typography.Text>
        </div>
      </ConditionalRenderer>

      <Form.Item
        name="name"
        label="Full Name"
        rules={signatoryNameRules}
      >
        <Input
          placeholder="e.g. Prof. Sabo Ibrahim B/Kudu"
          autoComplete="off"
        />
      </Form.Item>

      <Flex gap={12}>
        <Form.Item
          name="position"
          label="Position"
          rules={signatoryPositionRules}
          style={{ flex: 1 }}
        >
          <Input
            placeholder="e.g. VICE-CHANCELLOR"
            autoComplete="off"
          />
        </Form.Item>

        <Form.Item
          name="title"
          label="Title (optional)"
          rules={signatoryTitleRules}
          style={{ flex: 1 }}
        >
          <Input
            placeholder="e.g. Vice-Chancellor"
            autoComplete="off"
          />
        </Form.Item>
      </Flex>

      <Form.Item
        name="qualification"
        label="Qualification (optional)"
        rules={signatoryQualificationRules}
      >
        <Input.TextArea
          placeholder="e.g. B.Eng. (BUK), M.Eng. (UNIBEN), PhD (BUK)"
          autoComplete="off"
          rows={2}
        />
      </Form.Item>

      <Form.Item
        name="applyTo"
        label="Apply To"
        rules={[{ required: true, message: "Select at least one document type." }]}
      >
        <Checkbox.Group style={{ width: "100%" }}>
          <Flex wrap="wrap" gap={8}>
            {APPLY_TO_OPTIONS.map((opt) => (
              <Checkbox
                key={opt.value}
                value={opt.value}
                style={{ marginInlineStart: 0 }}
              >
                {opt.label}
              </Checkbox>
            ))}
          </Flex>
        </Checkbox.Group>
      </Form.Item>

      <Flex gap={12}>
        <Form.Item
          name="order"
          label="Order"
          rules={signatoryOrderRules}
          style={{ flex: 1 }}
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="1" />
        </Form.Item>

        <Form.Item
          name="isActive"
          label="Active"
          valuePropName="checked"
          style={{ flex: 1 }}
        >
          <Switch />
        </Form.Item>
      </Flex>

      <Flex justify="flex-end" gap={8} style={{ marginTop: 8 }}>
        <Button onClick={onClose}>Cancel</Button>
        <Button type="primary" onClick={() => void handleCommit()}>
          {flags.isEditMode ? "Update" : "Add"}
        </Button>
      </Flex>
    </Form>
  );
}

// ── Modal shell ───────────────────────────────────────────────────────────────

export function SignatoriesConfigModal({
  open,
  onClose,
  state,
  actions,
  flags,
}: SignatoriesConfigModalProps) {
  const token = useToken();

  // Stable key: changes whenever the modal opens or the edit target changes,
  // causing Step1 and Step2 to remount with fresh initialValues.
  const stepKey = `${state.editTarget?._localId ?? "new"}-${open ? "open" : "closed"}`;

  const stepItems = [
    { title: "Signature Upload" },
    { title: "Details" },
  ];

  return (
    <Modal
      title={flags.isEditMode ? "Edit Signatory" : "Add Signatory"}
      open={open}
      onCancel={onClose}
      footer={null}
      width={560}
      closable
      destroyOnHidden
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: "16px 24px" }}>
        <Steps
          current={state.modalStep}
          items={stepItems}
          size="small"
          style={{ marginBottom: 24 }}
        />

        <ConditionalRenderer when={state.modalStep === 0}>
          <SignatoryStep1
            key={`step1-${stepKey}`}
            state={state}
            actions={actions}
            flags={flags}
            onClose={onClose}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={state.modalStep === 1}>
          <SignatoryStep2
            key={`step2-${stepKey}`}
            state={state}
            actions={actions}
            flags={flags}
            onClose={onClose}
          />
        </ConditionalRenderer>
      </div>
    </Modal>
  );
}
