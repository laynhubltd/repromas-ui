// Feature: system-config
import { Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import {
    DeleteOutlined,
    EditOutlined,
    FilterOutlined,
    MoreOutlined,
    PlusOutlined,
} from "@ant-design/icons";
import { Badge, Button, Dropdown, Flex, Popover, Select, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import type {
    ConfigKey,
    ConfigScope,
    CreditLoadLimitsValue,
    ProgramOption,
    SystemConfig,
} from "../types/system-config";

// ── Pure functions (exported for independent testability) ─────────────────────

/**
 * Formats the value summary for a SystemConfig record.
 * Property 3: Value summary formatting
 */
export function formatValueSummary(config: SystemConfig): string {
  if (config.configKey === "CREDIT_LOAD_LIMITS") {
    const val = config.configValue as CreditLoadLimitsValue;
    return `Min: ${val.min_credits} | Max: ${val.max_credits}`;
  }
  if (config.configKey === "FORCE_CARRYOVER_FIRST") {
    return config.configValue === true ? "Enabled" : "Disabled";
  }
  return String(config.configValue);
}

/**
 * Resolves a referenceId to a program name, falling back to "ID: {referenceId}" or "Global".
 * Property 4: ReferenceId resolution with fallback
 */
export function resolveReferenceId(
  referenceId: number | null,
  programs: ProgramOption[],
): string {
  if (referenceId === null) return "Global";
  const match = programs.find((p) => p.id === referenceId);
  return match ? match.name : `ID: ${referenceId}`;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SCOPE_COLORS: Record<ConfigScope, string> = {
  GLOBAL: "blue",
  PROGRAM: "green",
  SESSION: "orange",
  SEMESTER: "purple",
};

const CONFIG_KEY_OPTIONS: { value: ConfigKey; label: string }[] = [
  { value: "CREDIT_LOAD_LIMITS", label: "Credit Load Limits" },
  { value: "FORCE_CARRYOVER_FIRST", label: "Force Carryover First" },
];

const SCOPE_OPTIONS: { value: ConfigScope; label: string }[] = [
  { value: "GLOBAL", label: "Global" },
  { value: "PROGRAM", label: "Program" },
  { value: "SESSION", label: "Session" },
  { value: "SEMESTER", label: "Semester" },
];

// ── Props ─────────────────────────────────────────────────────────────────────

type SystemConfigTableProps = {
  configs: SystemConfig[];
  programs: ProgramOption[];
  configKeyFilter: ConfigKey | undefined;
  scopeFilter: ConfigScope | undefined;
  activeFilterCount: number;
  isFiltering: boolean;
  onEdit: (config: SystemConfig) => void;
  onDelete: (config: SystemConfig) => void;
  onOpenCreate: () => void;
  onConfigKeyFilterChange: (value: ConfigKey | undefined) => void;
  onScopeFilterChange: (value: ConfigScope | undefined) => void;
  onClearFilters: () => void;
};

// ── Filter Popover ────────────────────────────────────────────────────────────

type FilterPopoverProps = {
  configKeyFilter: ConfigKey | undefined;
  scopeFilter: ConfigScope | undefined;
  activeFilterCount: number;
  onConfigKeyFilterChange: (value: ConfigKey | undefined) => void;
  onScopeFilterChange: (value: ConfigScope | undefined) => void;
  onClearFilters: () => void;
};

function FilterPopover({
  configKeyFilter,
  scopeFilter,
  activeFilterCount,
  onConfigKeyFilterChange,
  onScopeFilterChange,
  onClearFilters,
}: FilterPopoverProps) {
  const [open, setOpen] = useState(false);
  const token = useToken();

  const content = (
    <Flex vertical gap={12} style={{ width: 240 }}>
      <div>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 4 }}
        >
          Config Key
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          value={configKeyFilter}
          onChange={(val: ConfigKey | undefined) => onConfigKeyFilterChange(val)}
          options={CONFIG_KEY_OPTIONS}
        />
      </div>
      <div>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 4 }}
        >
          Scope
        </Typography.Text>
        <Select
          allowClear
          placeholder="Any"
          style={{ width: "100%" }}
          value={scopeFilter}
          onChange={(val: ConfigScope | undefined) => onScopeFilterChange(val)}
          options={SCOPE_OPTIONS}
        />
      </div>
      <Button
        size="small"
        onClick={() => {
          onClearFilters();
          setOpen(false);
        }}
      >
        Clear Filters
      </Button>
    </Flex>
  );

  return (
    <Popover
      content={content}
      title="Filter Configs"
      trigger="click"
      open={open}
      onOpenChange={setOpen}
      placement="bottomRight"
    >
      <Badge count={activeFilterCount} size="small">
        <Button icon={<FilterOutlined />}>Filters</Button>
      </Badge>
    </Popover>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function SystemConfigTable({
  configs,
  programs,
  configKeyFilter,
  scopeFilter,
  activeFilterCount,
  isFiltering,
  onEdit,
  onDelete,
  onOpenCreate,
  onConfigKeyFilterChange,
  onScopeFilterChange,
  onClearFilters,
}: SystemConfigTableProps) {
  const token = useToken();

  const columns: ColumnsType<SystemConfig> = [
    {
      title: "Config Key",
      dataIndex: "configKey",
      key: "configKey",
      render: (key: ConfigKey) => (
        <Typography.Text style={{ whiteSpace: "nowrap" }}>
          {key === "CREDIT_LOAD_LIMITS" ? "Credit Load Limits" : "Force Carryover First"}
        </Typography.Text>
      ),
    },
    {
      title: "Scope",
      dataIndex: "scope",
      key: "scope",
      render: (scope: ConfigScope) => (
        <Tag color={SCOPE_COLORS[scope]}>{scope}</Tag>
      ),
    },
    {
      title: "Program / Reference",
      key: "reference",
      render: (_: unknown, record: SystemConfig) => (
        <Typography.Text>
          {resolveReferenceId(record.referenceId, programs)}
        </Typography.Text>
      ),
    },
    {
      title: "Value Summary",
      key: "valueSummary",
      render: (_: unknown, record: SystemConfig) => {
        if (record.configKey === "FORCE_CARRYOVER_FIRST") {
          const enabled = record.configValue === true;
          return (
            <Tag color={enabled ? "green" : "default"}>
              {enabled ? "Enabled" : "Disabled"}
            </Tag>
          );
        }
        return (
          <Typography.Text style={{ whiteSpace: "nowrap" }}>
            {formatValueSummary(record)}
          </Typography.Text>
        );
      },
    },
    {
      title: "Description",
      dataIndex: "description",
      key: "description",
      render: (desc: string | null) =>
        desc ? (
          <Typography.Text>{desc}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 60,
      render: (_: unknown, record: SystemConfig) => {
        const menuItems = [
          {
            key: "edit",
            label: (
              <PermissionGuard permission={Permission.SystemConfigsUpdate}>
                <span>Edit</span>
              </PermissionGuard>
            ),
            icon: <EditOutlined />,
            onClick: () => onEdit(record),
          },
          {
            key: "delete",
            label: (
              <PermissionGuard permission={Permission.SystemConfigsDelete}>
                <span style={{ color: token.colorError }}>Delete</span>
              </PermissionGuard>
            ),
            icon: <DeleteOutlined style={{ color: token.colorError }} />,
            onClick: () => onDelete(record),
            danger: true as const,
          },
        ];

        return (
          <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: token.colorTextTertiary }}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <>
      <Flex
        justify="space-between"
        align="center"
        style={{ padding: `${token.paddingSM}px ${token.paddingMD}px` }}
      >
        <Typography.Text strong>System Configurations</Typography.Text>
        <Flex gap={token.marginXS} align="center">
          <FilterPopover
            configKeyFilter={configKeyFilter}
            scopeFilter={scopeFilter}
            activeFilterCount={activeFilterCount}
            onConfigKeyFilterChange={onConfigKeyFilterChange}
            onScopeFilterChange={onScopeFilterChange}
            onClearFilters={onClearFilters}
          />
          <PermissionGuard permission={Permission.SystemConfigsCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreate}>
              Create Config
            </Button>
          </PermissionGuard>
        </Flex>
      </Flex>

      <ConditionalRenderer
        when={configs.length === 0 && !isFiltering}
        wrapper={centeredBox({
          border: `1px dashed ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          margin: `0 ${token.marginMD}px ${token.marginMD}px`,
        })}
      >
        <Flex vertical align="center" gap={token.marginSM}>
          <Typography.Text type="secondary">No system configurations yet.</Typography.Text>
          <PermissionGuard permission={Permission.SystemConfigsCreate}>
            <Button type="primary" icon={<PlusOutlined />} onClick={onOpenCreate}>
              Create Config
            </Button>
          </PermissionGuard>
        </Flex>
      </ConditionalRenderer>

      <ConditionalRenderer when={configs.length > 0 || isFiltering}>
        <Table<SystemConfig>
          dataSource={configs}
          columns={columns}
          rowKey="id"
          pagination={false}
        />
      </ConditionalRenderer>
    </>
  );
}
