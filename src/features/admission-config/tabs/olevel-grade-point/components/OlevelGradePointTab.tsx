import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { OLEVEL_GRADE_POINT_ITEMS_PER_PAGE } from "@/shared/constants/olevelGradePointOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Col, Flex, Input, Pagination, Row, Typography } from "antd";
import { useOlevelGradePointTab } from "../hooks/useOlevelGradePointTab";
import { OlevelGradePointCard } from "./OlevelGradePointCard";
import { DeleteOlevelGradePointModal } from "./modals/DeleteOlevelGradePointModal";
import { OlevelGradePointFormModal } from "./modals/OlevelGradePointFormModal";

export function OlevelGradePointTab() {
  const token = useToken();
  const { state, actions, flags } = useOlevelGradePointTab();
  const {
    gradePoints,
    totalItems,
    maxPoints,
    isLoading,
    isError,
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
    refetch,
  } = actions;
  const { hasData, isSearchActive } = flags;

  const cardState = isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <ExplainerCallout
        intent="info"
        collapsible
        title="O'Level Grade Points"
        body="Define how each O'Level grade label maps to admission scoring points. These mappings are used when validating candidate O'Level grade lines and when computing school-side scores. Grade labels are normalized to uppercase and must be unique per tenant."
      />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Mappings"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Highest Points"
            value={maxPoints}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="On This Page"
            value={gradePoints.length}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Input
          placeholder="Search by grade label…"
          prefix={<SearchOutlined />}
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          allowClear
          style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
        />

        <PermissionGuard permission={Permission.AdmissionOlevelGradePointsCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Grade Mapping
          </Button>
        </PermissionGuard>
      </Flex>

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={6} variant="card" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load O'Level grade mappings."
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
            No grade mappings configured yet. Create your first mapping to define
            how grades convert to admission points.
          </Typography.Text>
          <PermissionGuard permission={Permission.AdmissionOlevelGradePointsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}
              style={{ fontWeight: 600 }}
            >
              Create Grade Mapping
            </Button>
          </PermissionGuard>
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
            No grade mappings match your search.
          </Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={16}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: 16,
              }}
            >
              {gradePoints.map((gradePoint) => (
                <OlevelGradePointCard
                  key={gradePoint.id}
                  gradePoint={gradePoint}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>

            <ConditionalRenderer
              when={totalItems > OLEVEL_GRADE_POINT_ITEMS_PER_PAGE}
            >
              <Flex justify="flex-end">
                <Pagination
                  current={page}
                  pageSize={OLEVEL_GRADE_POINT_ITEMS_PER_PAGE}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                />
              </Flex>
            </ConditionalRenderer>
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      <OlevelGradePointFormModal
        open={formOpen}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteOlevelGradePointModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />
    </Flex>
  );
}
