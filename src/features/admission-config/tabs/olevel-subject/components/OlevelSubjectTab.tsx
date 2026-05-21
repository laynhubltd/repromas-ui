import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { ExplainerCallout } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DatabaseOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Flex, Input, Pagination, Typography } from "antd";
import { useOlevelSubjectTab } from "../hooks/useOlevelSubjectTab";
import { OlevelSubjectCard } from "./OlevelSubjectCard";
import { DeleteOlevelSubjectModal } from "./modals/DeleteOlevelSubjectModal";
import { OlevelSubjectFormModal } from "./modals/OlevelSubjectFormModal";

const ITEMS_PER_PAGE = 30;

export function OlevelSubjectTab() {
  const token = useToken();
  const { state, actions, flags } = useOlevelSubjectTab();
  const {
    subjects,
    totalItems,
    isLoading,
    isError,
    isPopulating,
    search,
    page,
    formTarget,
    formOpen,
    deleteTarget,
    deleteOpen,
  } = state;
  const {
    handleSearchChange,
    handlePageChange,
    handleOpenCreate,
    handleOpenEdit,
    handleCloseForm,
    handleOpenDelete,
    handleCloseDelete,
    handlePopulate,
    refetch,
  } = actions;
  const { hasData, isSearchActive } = flags;

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title="O'Level Subject Catalog"
        body="Manage your tenant's WAEC/NECO subject list. Subjects are used in program requirements, candidate grades, JAMB combinations, and CAPS uploads. Initialize the standard catalog once, then add or edit subjects as needed. Each subject name must be unique per tenant."
      />

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Input
          placeholder="Search subjects by name…"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
        />

        <Flex gap={12} wrap="wrap">
          <PermissionGuard permission={Permission.AdmissionOlevelSubjectsManage}>
            <Button
              icon={<DatabaseOutlined />}
              onClick={handlePopulate}
              loading={isPopulating}
              disabled={isPopulating}
            >
              Populate standard subjects
            </Button>
          </PermissionGuard>

          <PermissionGuard permission={Permission.AdmissionOlevelSubjectsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Subject
            </Button>
          </PermissionGuard>
        </Flex>
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load O'Level subjects."
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && !isSearchActive && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16, textAlign: "center" }}
          >
            No O'Level subjects configured yet. Populate the standard catalog or
            create your first subject.
          </Typography.Text>
          <Flex gap={12} wrap="wrap" justify="center">
            <PermissionGuard permission={Permission.AdmissionOlevelSubjectsManage}>
              <Button
                icon={<DatabaseOutlined />}
                onClick={handlePopulate}
                loading={isPopulating}
              >
                Populate standard subjects
              </Button>
            </PermissionGuard>
            <PermissionGuard permission={Permission.AdmissionOlevelSubjectsCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ fontWeight: 600 }}
              >
                Create Subject
              </Button>
            </PermissionGuard>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!hasData && isSearchActive && !isError}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">
            No subjects match your search.
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={8}>
            {subjects.map((subject) => (
              <OlevelSubjectCard
                key={subject.id}
                subject={subject}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
              />
            ))}

            <ConditionalRenderer when={totalItems > ITEMS_PER_PAGE}>
              <Flex justify="flex-end" style={{ marginTop: 16 }}>
                <Pagination
                  current={page}
                  pageSize={ITEMS_PER_PAGE}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </Flex>
            </ConditionalRenderer>
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <OlevelSubjectFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteOlevelSubjectModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
