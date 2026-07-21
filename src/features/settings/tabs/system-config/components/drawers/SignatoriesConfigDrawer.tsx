import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Button,
  Divider,
  Drawer,
  Flex,
  Image,
  Space,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import type { useSignatoriesConfig } from "../../hooks/useSignatoriesConfig";
import type { LocalSignatoryEntry } from "../../types/signatories";
import { APPLY_TO_OPTIONS } from "../../types/signatories";

type SignatoriesController = ReturnType<typeof useSignatoriesConfig>;

export type SignatoriesConfigDrawerProps = {
  open: boolean;
  onClose: () => void;
  state: SignatoriesController["state"];
  actions: SignatoriesController["actions"];
  flags: SignatoriesController["flags"];
};

// ── Apply-to label lookup ─────────────────────────────────────────────────────

const APPLY_TO_LABEL_MAP = new Map(
  APPLY_TO_OPTIONS.map((opt) => [opt.value, opt.label]),
);

// ── Single signatory row ──────────────────────────────────────────────────────

type SignatoryRowProps = {
  entry: LocalSignatoryEntry;
  onEdit: (entry: LocalSignatoryEntry) => void;
  onRemove: (localId: string) => void;
};

function SignatoryRow({ entry, onEdit, onRemove }: SignatoryRowProps) {
  const token = useToken();

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadius,
        padding: "12px 16px",
        background: token.colorBgContainer,
        marginBottom: 10,
      }}
    >
      <Flex justify="space-between" align="flex-start" gap={12}>
        {/* Left: signature thumbnail + identity */}
        <Flex gap={12} align="flex-start" style={{ flex: 1, minWidth: 0 }}>
          <ConditionalRenderer when={!!entry.publicUrl}>
            <Image
              src={entry.publicUrl}
              alt="Signature"
              width={56}
              height={40}
              style={{ objectFit: "contain", flexShrink: 0 }}
              preview={false}
            />
          </ConditionalRenderer>

          <ConditionalRenderer when={!entry.publicUrl}>
            <Avatar
              shape="square"
              size={48}
              icon={<EditOutlined />}
              style={{ flexShrink: 0, background: token.colorBgLayout }}
            />
          </ConditionalRenderer>

          <div style={{ minWidth: 0, flex: 1 }}>
            {/* Primary: display name if set, fallback to user label */}
            <Typography.Text strong ellipsis style={{ display: "block" }}>
              {entry.name || entry.userLabel}
            </Typography.Text>

            <ConditionalRenderer when={!!entry.name}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM, display: "block" }}
              >
                {entry.userLabel}
              </Typography.Text>
            </ConditionalRenderer>

            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM, display: "block" }}
            >
              {entry.roleLabel}
            </Typography.Text>

            <ConditionalRenderer when={!!entry.title || !!entry.position}>
              <Typography.Text
                style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 2 }}
              >
                {[entry.title, entry.position].filter(Boolean).join(" · ")}
              </Typography.Text>
            </ConditionalRenderer>

            <ConditionalRenderer when={!!entry.qualification}>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 2 }}
                ellipsis={{ tooltip: entry.qualification }}
              >
                {entry.qualification}
              </Typography.Text>
            </ConditionalRenderer>

            {/* Apply-to chips */}
            <Flex gap={4} wrap="wrap" style={{ marginTop: 6 }}>
              {entry.applyTo.map((val) => (
                <Tag key={val} style={{ margin: 0, fontSize: token.fontSizeSM }}>
                  {APPLY_TO_LABEL_MAP.get(val) ?? val}
                </Tag>
              ))}
            </Flex>
          </div>
        </Flex>

        {/* Right: order badge + active badge + actions */}
        <Flex gap={8} align="center" style={{ flexShrink: 0 }}>
          <Tooltip title="Order">
            <Badge
              count={entry.order}
              style={{ background: token.colorBgLayout, color: token.colorTextSecondary }}
              showZero
            />
          </Tooltip>

          <Tag color={entry.isActive ? "success" : "default"} style={{ margin: 0 }}>
            {entry.isActive ? "Active" : "Inactive"}
          </Tag>

          <Space size={4}>
            <Tooltip title="Edit">
              <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={() => onEdit(entry)}
              />
            </Tooltip>
            <Tooltip title="Remove">
              <Button
                type="text"
                size="small"
                danger
                icon={<DeleteOutlined />}
                onClick={() => onRemove(entry._localId)}
              />
            </Tooltip>
          </Space>
        </Flex>
      </Flex>
    </div>
  );
}

// ── Drawer ────────────────────────────────────────────────────────────────────

export function SignatoriesConfigDrawer({
  open,
  onClose,
  state,
  actions,
  flags,
}: SignatoriesConfigDrawerProps) {
  const token = useToken();

  return (
    <Drawer
      open={open}
      onClose={onClose}
      placement="right"
      width={560}
      destroyOnHidden={false}
      title="Signatories"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="small"
          onClick={actions.handleOpenAdd}
        >
          Add Signatory
        </Button>
      }
      footer={
        <Flex justify="flex-end" gap={8}>
          <Button onClick={onClose}>Close</Button>
          <Button
            type="primary"
            loading={state.isSaving}
            disabled={state.isLoading}
            onClick={() => void actions.handleSave()}
          >
            Save Signatories
          </Button>
        </Flex>
      }
    >
      {/* Fetch error */}
      <ConditionalRenderer when={!!state.sectionError}>
        <ErrorAlert
          variant="section"
          error={state.sectionError}
          onRetry={actions.refetch}
        />
      </ConditionalRenderer>

      {/* Loading skeleton */}
      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={3} />}
        minHeight="120px"
      >
        {/* Not configured info */}
        <ConditionalRenderer when={flags.isNotConfigured && !flags.hasSignatories}>
          <div
            style={{
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              padding: 16,
              background: token.colorBgContainer,
              marginBottom: 16,
            }}
          >
            <Typography.Text type="secondary">
              No signatories configured yet. Click{" "}
              <Typography.Text strong>Add Signatory</Typography.Text> to get
              started.
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        {/* Empty list (configured but empty after removals) */}
        <ConditionalRenderer when={!flags.isNotConfigured && !flags.hasSignatories}>
          <ConditionalRenderer
            when={true}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
              marginBottom: 16,
            })}
          >
            <Typography.Text type="secondary">
              All signatories removed. Add one or save to clear the config.
            </Typography.Text>
          </ConditionalRenderer>
        </ConditionalRenderer>

        {/* Signatory list */}
        <ConditionalRenderer when={flags.hasSignatories}>
          <div>
            {state.localList.map((entry) => (
              <SignatoryRow
                key={entry._localId}
                entry={entry}
                onEdit={actions.handleOpenEdit}
                onRemove={actions.handleRemoveEntry}
              />
            ))}
          </div>
        </ConditionalRenderer>

        {/* Save reminder when list has items */}
        <ConditionalRenderer when={flags.hasSignatories}>
          <Divider style={{ marginTop: 8, marginBottom: 12 }} />
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            Changes are held locally. Click{" "}
            <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
              Save Signatories
            </Typography.Text>{" "}
            to persist them.
          </Typography.Text>
        </ConditionalRenderer>
      </DataLoader>
    </Drawer>
  );
}
