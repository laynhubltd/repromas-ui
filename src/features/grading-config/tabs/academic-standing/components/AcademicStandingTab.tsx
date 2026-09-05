// Feature: grading-config
import { DashCard } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Flex,
  Input,
  Pagination,
  Row,
  Select,
  Typography,
} from "antd";
import { AcademicStandingBanner } from "./AcademicStandingBanner";
import { AcademicStandingCard } from "./AcademicStandingCard";
import { AcademicStandingFormModal } from "./AcademicStandingFormModal";
import { DeleteAcademicStandingModal } from "./DeleteAcademicStandingModal";
import { useAcademicStandingTab } from "../hooks/useAcademicStandingTab";
import type { AcademicStandingScope } from "../types/academic-standing";

export function AcademicStandingTab() {
  const token = useToken();
  const { academicUnit } = useInstitutionTerminology();
  const { state, actions, flags } = useAcademicStandingTab();
  const {
    searchInput,
    scopeFilter,
    page,
    itemsPerPage,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    standings,
    totalItems,
    globalCount,
    scopedCount,
    isLoading,
    isError,
  } = state;
  const {
    handleSearchChange,
    handleScopeFilterChange,
    handlePageChange,
    handleOpenUpsert,
    handleCloseUpsert,
    handleOpenDelete,
    handleCloseDelete,
    refetch,
  } = actions;
  const { hasData, isSearchOrFilterActive } = flags;

  const cardState = isLoading ? "loading" : "default";

  const scopeFilterOptions = [
    { value: undefined as unknown as AcademicStandingScope, label: "All Scopes" },
    { value: "GLOBAL" as AcademicStandingScope, label: "Global (Institution)" },
    { value: "FACULTY" as AcademicStandingScope, label: academicUnit.allFilterLabel },
    { value: "DEPARTMENT" as AcademicStandingScope, label: "Department Scope" },
    { value: "PROGRAM" as AcademicStandingScope, label: "Program Scope" },
  ];

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Banner */}
      <AcademicStandingBanner />

      {/* Metrics row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <DashCard
            title="Total Standing Policies"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Global Policies"
            value={globalCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={8}>
          <DashCard
            title="Scoped Policies"
            value={scopedCount}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      {/* Toolbar */}
      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search policies by name…"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 280 }}
          />
          <Select
            placeholder="All Scopes"
            allowClear
            value={scopeFilter ?? undefined}
            onChange={(value) => handleScopeFilterChange(value)}
            options={scopeFilterOptions}
            style={{ minWidth: 180 }}
          />
        </Flex>

        <PermissionGuard permission={Permission.AcademicStandingsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenUpsert(null)}
            style={{ fontWeight: 600 }}
          >
            Add Standing Policy
          </Button>
        </PermissionGuard>
      </Flex>

      {/* Content Area */}
      <DataLoader loading={isLoading} loader={<SkeletonRows count={3} />}>
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load academic standing policies"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError}>
          <ConditionalRenderer
            when={!hasData}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadiusLG,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text type="secondary">
              {isSearchOrFilterActive
                ? "No academic standing policies match your search criteria."
                : "No academic standing policies have been configured yet. Create one to begin."}
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer when={hasData}>
            <Flex vertical gap={16}>
              {standings.map((standing) => (
                <AcademicStandingCard
                  key={standing.id}
                  standing={standing}
                  onEdit={handleOpenUpsert}
                  onDelete={handleOpenDelete}
                />
              ))}

              {totalItems > itemsPerPage && (
                <Flex justify="flex-end" style={{ marginTop: 8 }}>
                  <Pagination
                    current={page}
                    pageSize={itemsPerPage}
                    total={totalItems}
                    onChange={(p) => handlePageChange(p)}
                    showSizeChanger={false}
                    size="small"
                  />
                </Flex>
              )}
            </Flex>
          </ConditionalRenderer>
        </ConditionalRenderer>
      </DataLoader>

      {/* Upsert Modal */}
      <AcademicStandingFormModal
        open={upsertOpen}
        target={upsertTarget}
        onClose={handleCloseUpsert}
      />

      {/* Delete Modal */}
      <DeleteAcademicStandingModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
