import { Table } from "@/components/ui-kit";
import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Input, Select, Tag } from "antd";
import type { ColumnsType } from "antd/es/table/interface";
import {
  ITEMS_PER_PAGE,
  getStatusTag,
  useCurriculumVersionTab,
} from "../hooks/useCurriculumVersionTab";
import type { CurriculumVersion } from "../types/curriculum-version";
import { CloneVersionModal } from "./CloneVersionModal";
import { CreateVersionModal } from "./CreateVersionModal";
import { CurriculumVersionBanner } from "./CurriculumVersionBanner";
import { DeleteVersionModal } from "./DeleteVersionModal";
import { EditVersionModal } from "./EditVersionModal";

// Re-export pure helpers so tests can import them from this module
export {
  calcTotalPages,
  getMenuItems,
  getStatusTag,
  resetPageOnFilterChange,
  statusFilterToQueryParam,
} from "../hooks/useCurriculumVersionTab";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CurriculumVersionTab() {
  const { state, actions } = useCurriculumVersionTab();
  const {
    search,
    statusFilter,
    scopeFilter,
    page,
    versions,
    totalItems,
    isLoading,
    isError,
    createModalOpen,
    cloneTarget,
    editTarget,
    deleteTarget,
    debounceTimer,
  } = state;
  const {
    handleSearchChange,
    handleFilterChange,
    handleScopeFilterChange,
    handleActivate,
    handleSortChange,
    setCreateModalOpen,
    setCloneTarget,
    setEditTarget,
    setDeleteTarget,
    refetch,
  } = actions;

  const columns: ColumnsType<CurriculumVersion> = [
    {
      title: "Name",
      dataIndex: "name",
      key: "name",
      sorter: true,
      sortDirections: ["ascend", "descend"],
    },
    {
      title: "Scope",
      key: "scope",
      render: (_: unknown, record: CurriculumVersion) => {
        if (record.scope === "PROGRAM") {
          return (
            <Tag color="purple">
              {record.program ? `${record.program.code} - ${record.program.name}` : `Program #${record.referenceId}`}
            </Tag>
          );
        }
        return <Tag color="cyan">Global Standard</Tag>;
      },
    },
    {
      title: "Status",
      dataIndex: "isActiveForAdmission",
      key: "isActiveForAdmission",
      render: (isActive: boolean) => {
        const { color, label } = getStatusTag(isActive);
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Created At",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (createdAt: string) => formatDate(createdAt),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 64,
      render: (_: unknown, record: CurriculumVersion) => (
        <Dropdown
          trigger={["click"]}
          menu={{
            items: [
              {
                key: "edit",
                label: "Edit",
                onClick: () => setEditTarget(record),
              },
              {
                key: "clone",
                label: "Clone / Branch",
                onClick: () => setCloneTarget(record),
              },
              {
                key: "activate",
                label: "Activate",
                disabled: record.isActiveForAdmission,
                onClick: () => handleActivate(record),
              },
              {
                key: "delete",
                label: "Delete",
                danger: true,
                onClick: () => setDeleteTarget(record),
              },
            ],
          }}
        >
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16 }} />}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      ),
    },
  ];

  const tableState = isLoading ? "loading" : isError ? "error" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <CurriculumVersionBanner />

      <Flex gap={12} wrap>
        <Input.Search
          placeholder="Search by name…"
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          onSearch={() => {
            if (debounceTimer.current) clearTimeout(debounceTimer.current);
          }}
          allowClear
          style={{ maxWidth: 320 }}
        />
        <Select
          value={scopeFilter}
          onChange={handleScopeFilterChange}
          style={{ width: 160 }}
          options={[
            { value: "all", label: "All Scopes" },
            { value: "GLOBAL", label: "Global Standards" },
            { value: "PROGRAM", label: "Program Specific" },
          ]}
        />
        <Select
          value={statusFilter}
          onChange={handleFilterChange}
          style={{ width: 140 }}
          options={[
            { value: "all", label: "All Statuses" },
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
      </Flex>

      <Table<CurriculumVersion>
        header={{
          title: "Curriculum Versions",
          extra: (
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalOpen(true)}
            >
              Add Version
            </Button>
          ),
        }}
        rowKey="id"
        dataSource={versions}
        columns={columns}
        state={tableState}
        size="md"
        density="comfortable"
        scroll={{ x: true }}
        onChange={handleSortChange}
        pagination={
          totalItems > ITEMS_PER_PAGE
            ? {
                current: page,
                pageSize: ITEMS_PER_PAGE,
                total: totalItems,
                onChange: (p: number) => actions.setPage(p),
              }
            : false
        }
        emptyState={
          !isLoading && !isError
            ? {
                title: "No curriculum versions yet",
                action: (
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => setCreateModalOpen(true)}
                  >
                    Add Version
                  </Button>
                ),
              }
            : isError
              ? {
                  title: "Could not load curriculum versions",
                  description: "An error occurred while fetching data.",
                  action: (
                    <Button size="small" onClick={() => refetch()}>
                      Retry
                    </Button>
                  ),
                }
              : undefined
        }
      />

      <CreateVersionModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
      />
      <CloneVersionModal
        open={cloneTarget !== null}
        target={cloneTarget}
        onClose={() => setCloneTarget(null)}
      />
      <EditVersionModal
        open={editTarget !== null}
        target={editTarget}
        onClose={() => setEditTarget(null)}
      />
      <DeleteVersionModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={() => setDeleteTarget(null)}
      />
    </Flex>
  );
}

