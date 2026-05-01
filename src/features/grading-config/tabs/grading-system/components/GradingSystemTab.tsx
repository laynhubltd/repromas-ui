// Feature: grading-config
import { DashCard } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { GRADING_SYSTEM_SCOPE_OPTIONS } from "@/shared/constants/gradingSystemOptions";
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
import { useGradingSystemTab } from "../hooks/useGradingSystemTab";
import { DeleteGradingSystemModal } from "./DeleteGradingSystemModal";
import { GradingSystemBanner } from "./GradingSystemBanner";
import { GradingSystemCard } from "./GradingSystemCard";
import { GradingSystemFormModal } from "./GradingSystemFormModal";

const SCOPE_FILTER_OPTIONS = [
  { value: undefined as unknown as string, label: "All Scopes" },
  ...GRADING_SYSTEM_SCOPE_OPTIONS,
];

export function GradingSystemTab() {
  const token = useToken();
  const { state, actions, flags } = useGradingSystemTab();
  const {
    searchInput,
    scopeFilter,
    page,
    itemsPerPage,
    upsertOpen,
    upsertTarget,
    deleteOpen,
    deleteTarget,
    systems,
    totalItems,
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

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Banner */}
      <GradingSystemBanner />

      {/* Metrics row */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Grading Systems"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      {/* Toolbar: search + scope filter + create button */}
      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search by name…"
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
            style={{ minWidth: 160 }}
            options={SCOPE_FILTER_OPTIONS}
          />
        </Flex>
        <PermissionGuard permission={Permission.GradingSchemaConfigsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => handleOpenUpsert()}
            style={{ fontWeight: 600 }}
          >
            Create Grading System
          </Button>
        </PermissionGuard>
      </Flex>

      {/* Content area */}
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        {/* Error state */}
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load grading systems"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        {/* Empty state — no search or filter active */}
        <ConditionalRenderer
          when={!isError && !hasData && !isSearchOrFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 16 }}
          >
            No grading systems yet. Create your first grading system to get
            started.
          </Typography.Text>
          <PermissionGuard permission={Permission.GradingSchemaConfigsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenUpsert()}
              style={{ fontWeight: 600 }}
            >
              Create Grading System
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* Empty state — search or filter active but no results */}
        <ConditionalRenderer
          when={!isError && !hasData && isSearchOrFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: 8 }}
          >
            No results found matching your search or filter.
          </Typography.Text>
          <Button
            type="link"
            onClick={() => {
              handleSearchChange("");
              handleScopeFilterChange(undefined);
            }}
          >
            Clear filters
          </Button>
        </ConditionalRenderer>

        {/* Grading system card list */}
        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={8}>
            {systems.map((system) => (
              <GradingSystemCard
                key={system.id}
                system={system}
                onEdit={handleOpenUpsert}
                onDelete={handleOpenDelete}
              />
            ))}
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      {/* Pagination */}
      <ConditionalRenderer when={!isError}>
        <Flex justify="flex-end">
          <Pagination
            current={page}
            pageSize={itemsPerPage}
            total={totalItems}
            showSizeChanger
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </Flex>
      </ConditionalRenderer>

      {/* Modals */}
      <GradingSystemFormModal
        open={upsertOpen}
        target={upsertTarget}
        onClose={handleCloseUpsert}
      />
      <DeleteGradingSystemModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
