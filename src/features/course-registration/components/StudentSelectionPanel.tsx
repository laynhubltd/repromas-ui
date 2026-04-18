import { StatusBadge } from "@/features/student/components/StatusBadge";
import type { StudentStatus } from "@/features/student/types/student";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { STUDENT_STATUS_OPTIONS } from "@/shared/constants/studentOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
    ConditionalRenderer,
    centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { FilterOutlined } from "@ant-design/icons";
import {
    Badge,
    Button,
    Card,
    Flex,
    Form,
    Input,
    Pagination,
    Popover,
    Select,
    Space,
    Typography,
} from "antd";
import { useState } from "react";
import { useStudentSelectionPanel } from "../hooks/useStudentSelectionPanel";

export type StudentSelectionPanelProps = {
  selectedStudentId: number | null;
  onStudentSelect: (studentId: number) => void;
};

/**
 * Left panel for admin/staff users to search and select a student.
 *
 * View-only component — all business logic lives in useStudentSelectionPanel.
 * Integrates with the existing student feature APIs and components.
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6, 2.7, 15.1, 15.2, 15.3, 15.4
 */
export function StudentSelectionPanel({
  selectedStudentId,
  onStudentSelect,
}: StudentSelectionPanelProps) {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useStudentSelectionPanel(
    selectedStudentId,
    onStudentSelect,
  );

  const {
    students,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    matricSearch,
    programFilter,
    levelFilter,
    statusFilter,
    programs,
    levels,
    isProgramsLoading,
    isLevelsLoading,
  } = state;

  const {
    handleMatricSearchChange,
    handleProgramFilterChange,
    handleLevelFilterChange,
    handleStatusFilterChange,
    handlePageChange,
    handleStudentSelect,
    handleClearFilters,
    refetch,
  } = actions;

  const { isAnyFilterActive } = flags;

  const [filterOpen, setFilterOpen] = useState(false);

  const activeFilterCount = [programFilter, levelFilter, statusFilter].filter(
    (v) => v !== undefined,
  ).length;

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 260 }}>
      <Form layout="vertical" size="small">
        <Form.Item label="Program" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any program"
            allowClear
            showSearch
            optionFilterProp="label"
            loading={isProgramsLoading}
            value={programFilter}
            onChange={(val) =>
              handleProgramFilterChange(val as number | undefined)
            }
            style={{ width: "100%" }}
            options={programs.map((p) => ({ value: p.id, label: p.name }))}
          />
        </Form.Item>
        <Form.Item label="Level" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any level"
            allowClear
            loading={isLevelsLoading}
            value={levelFilter}
            onChange={(val) =>
              handleLevelFilterChange(val as number | undefined)
            }
            style={{ width: "100%" }}
            options={levels.map((l) => ({ value: l.id, label: l.name }))}
          />
        </Form.Item>
        <Form.Item label="Enrollment Status" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any status"
            allowClear
            value={statusFilter}
            onChange={(val) =>
              handleStatusFilterChange(val as StudentStatus | undefined)
            }
            style={{ width: "100%" }}
            options={STUDENT_STATUS_OPTIONS}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={handleClearFilters}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  return (
    <Card
      data-testid="student-selection-panel"
      style={{ height: "100%" }}
      styles={{ body: { padding: 12 } }}
    >
      {/* ─── Header ─────────────────────────────────────────────────────── */}
      <Typography.Text
        strong
        style={{
          display: "block",
          marginBottom: 12,
          fontSize: token.fontSizeLG,
        }}
      >
        Select Student
      </Typography.Text>

      {/* ─── Search & Filter Bar ─────────────────────────────────────────── */}
      <Flex gap={8} align="center" style={{ marginBottom: 12 }}>
        <Input
          placeholder="Search by matric number…"
          value={matricSearch}
          onChange={(e) => handleMatricSearchChange(e.target.value)}
          allowClear
          size={isMobile ? "middle" : "small"}
          style={{ flex: 1 }}
          data-testid="student-matric-search"
        />
        <Popover
          content={filterPopoverContent}
          title={
            <Space>
              <FilterOutlined />
              <span>Filters</span>
            </Space>
          }
          trigger="click"
          open={filterOpen}
          onOpenChange={setFilterOpen}
          placement="bottomRight"
          arrow={false}
        >
          <Badge count={activeFilterCount} size="small">
            <Button
              icon={<FilterOutlined />}
              size={isMobile ? "middle" : "small"}
              type={activeFilterCount > 0 ? "primary" : "default"}
              data-testid="student-filter-button"
            />
          </Badge>
        </Popover>
      </Flex>

      {/* ─── Student List ─────────────────────────────────────────────────── */}
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="inline" />}
      >
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load students"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !flags.hasData && !isAnyFilterActive}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">No students found.</Typography.Text>
        </ConditionalRenderer>

        <ConditionalRenderer
          when={!isError && !flags.hasData && isAnyFilterActive}
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
            No students match your search or filters.
          </Typography.Text>
          <Button type="link" size="small" onClick={handleClearFilters}>
            Clear filters
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && flags.hasData}>
          <Flex vertical gap={4}>
            {students.map((student) => {
              const isSelected = student.id === selectedStudentId;
              return (
                <div
                  key={student.id}
                  data-testid={`student-row-${student.id}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => handleStudentSelect(student.id)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleStudentSelect(student.id);
                    }
                  }}
                  aria-pressed={isSelected}
                  aria-label={`Select student ${student.firstName} ${student.lastName}, matric ${student.matricNumber}`}
                  style={{
                    padding: isMobile ? "14px 12px" : "10px 12px",
                    minHeight: isMobile ? 64 : undefined,
                    borderRadius: token.borderRadius,
                    border: `1px solid ${isSelected ? token.colorPrimary : token.colorBorderSecondary}`,
                    background: isSelected
                      ? `${token.colorPrimary}14`
                      : token.colorBgContainer,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {/* Name row */}
                  <Flex justify="space-between" align="center" gap={8}>
                    <Typography.Text
                      strong
                      style={{
                        fontSize: token.fontSize,
                        color: isSelected
                          ? token.colorPrimary
                          : token.colorText,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        flex: 1,
                      }}
                    >
                      {student.lastName}, {student.firstName}
                    </Typography.Text>
                    <StatusBadge status={student.status} />
                  </Flex>

                  {/* Matric number */}
                  <Typography.Text
                    type="secondary"
                    style={{
                      fontSize: token.fontSizeSM,
                      display: "block",
                      marginTop: 2,
                    }}
                  >
                    {student.matricNumber}
                  </Typography.Text>

                  {/* Program & Level */}
                  <Flex gap={8} style={{ marginTop: 4 }} wrap="wrap">
                    <ConditionalRenderer when={!!student.program}>
                      <Typography.Text
                        style={{
                          fontSize: token.fontSizeSM,
                          color: token.colorTextSecondary,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: 160,
                        }}
                      >
                        {student.program?.name}
                      </Typography.Text>
                    </ConditionalRenderer>
                    <ConditionalRenderer when={!!student.currentLevel}>
                      <Typography.Text
                        style={{
                          fontSize: token.fontSizeSM,
                          color: token.colorTextTertiary,
                          whiteSpace: "nowrap",
                        }}
                      >
                        · {student.currentLevel?.name}
                      </Typography.Text>
                    </ConditionalRenderer>
                  </Flex>
                </div>
              );
            })}
          </Flex>
        </ConditionalRenderer>
      </DataLoader>

      {/* ─── Pagination ──────────────────────────────────────────────────── */}
      <ConditionalRenderer when={totalItems > itemsPerPage}>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Pagination
            current={page}
            pageSize={itemsPerPage}
            total={totalItems}
            size="small"
            showSizeChanger={false}
            onChange={handlePageChange}
          />
        </div>
      </ConditionalRenderer>
    </Card>
  );
}
