import React from "react";
import {
  Badge,
  Button,
  Flex,
  Form,
  Popover,
  Select,
  Tag,
  Tooltip,
  Typography,
} from "antd";
import {
  FilterOutlined,
  ReloadOutlined,
  LockOutlined,
  CalendarOutlined,
} from "@ant-design/icons";
import { useToken } from "@/shared/hooks/useToken";
import { useDashboardFilterBar } from "../hooks/useDashboardFilterBar";
import type {
  DashboardFilterAction,
  DashboardFilterState,
} from "../state/dashboardFilterState";

export type DashboardFilterBarProps = {
  state: DashboardFilterState;
  dispatch: (action: DashboardFilterAction) => void;
  lastUpdatedText: string;
  onRefresh: () => void;
  isFetching: boolean;
  activeSessionName?: string | null;
  activeSemesterName?: string | null;
};

export const DashboardFilterBar: React.FC<DashboardFilterBarProps> = ({
  state,
  dispatch,
  lastUpdatedText,
  onRefresh,
  isFetching,
  activeSessionName,
  activeSemesterName,
}) => {
  const token = useToken();
  const {
    state: filterBarState,
    actions,
    terminology,
  } = useDashboardFilterBar({ state, dispatch });

  const {
    popoverOpen,
    filters,
    scopes,
    options,
    activeFilterCount,
    isLoadingOptions,
  } = filterBarState;

  const { academicUnit } = terminology;

  const filterContent = (
    <Flex vertical gap={12} style={{ width: 290 }}>
      <Form layout="vertical" size="small">
        {/* Session Filter */}
        <Form.Item label="Academic Session" style={{ marginBottom: 10 }}>
          <Select
            placeholder="All Sessions"
            allowClear
            value={filters.sessionId}
            onChange={actions.handleSessionChange}
            options={options.sessionOptions}
            loading={isLoadingOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* Faculty / Academic Unit Filter */}
        <Form.Item
          label={
            <Flex align="center" gap={4}>
              <span>{academicUnit.singular}</span>
              {scopes.isFacultyScoped && (
                <Tooltip title="Locked by your assigned role scope">
                  <LockOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />
                </Tooltip>
              )}
            </Flex>
          }
          style={{ marginBottom: 10 }}
        >
          <Select
            placeholder={academicUnit.selectPlaceholder}
            allowClear={!scopes.isFacultyScoped}
            disabled={scopes.isFacultyScoped}
            value={filters.facultyId}
            onChange={actions.handleFacultyChange}
            options={options.facultyOptions}
            loading={isLoadingOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* Department Filter */}
        <Form.Item
          label={
            <Flex align="center" gap={4}>
              <span>Department</span>
              {scopes.isDepartmentScoped && (
                <Tooltip title="Locked by your assigned role scope">
                  <LockOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />
                </Tooltip>
              )}
            </Flex>
          }
          style={{ marginBottom: 10 }}
        >
          <Select
            placeholder="Select Department"
            allowClear={!scopes.isDepartmentScoped}
            disabled={scopes.isDepartmentScoped}
            value={filters.departmentId}
            onChange={actions.handleDepartmentChange}
            options={options.departmentOptions}
            loading={isLoadingOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* Program Filter */}
        <Form.Item
          label={
            <Flex align="center" gap={4}>
              <span>Program</span>
              {scopes.isProgramScoped && (
                <Tooltip title="Locked by your assigned role scope">
                  <LockOutlined style={{ color: token.colorTextTertiary, fontSize: 12 }} />
                </Tooltip>
              )}
            </Flex>
          }
          style={{ marginBottom: 10 }}
        >
          <Select
            placeholder="Select Program"
            allowClear={!scopes.isProgramScoped}
            disabled={scopes.isProgramScoped}
            value={filters.programId}
            onChange={actions.handleProgramChange}
            options={options.programOptions}
            loading={isLoadingOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>

        {/* Level Filter */}
        <Form.Item label="Academic Level" style={{ marginBottom: 0 }}>
          <Select
            placeholder="All Levels"
            allowClear
            value={filters.levelId}
            onChange={actions.handleLevelChange}
            options={options.levelOptions}
            loading={isLoadingOptions}
            style={{ width: "100%" }}
          />
        </Form.Item>
      </Form>

      {activeFilterCount > 0 && (
        <Button
          type="link"
          size="small"
          onClick={actions.handleClearAll}
          style={{ padding: 0, alignSelf: "flex-start" }}
        >
          Clear all filters
        </Button>
      )}
    </Flex>
  );

  return (
    <Flex
      align="center"
      justify="space-between"
      wrap
      gap={12}
      style={{
        padding: `${token.paddingSM}px 0`,
        borderBottom: `1px solid ${token.colorBorderSecondary}`,
        width: "100%",
      }}
    >
      <Flex align="center" gap={10} wrap>
        <Popover
          content={filterContent}
          title={
            <Flex align="center" gap={6}>
              <FilterOutlined />
              <span>Filter Analytics</span>
            </Flex>
          }
          trigger="click"
          open={popoverOpen}
          onOpenChange={actions.setPopoverOpen}
          placement="bottomLeft"
          arrow={false}
        >
          <Badge count={activeFilterCount} size="small" offset={[-2, 2]}>
            <Button
              icon={<FilterOutlined />}
              type={activeFilterCount > 0 ? "primary" : "default"}
            >
              Filters
            </Button>
          </Badge>
        </Popover>

        {activeSessionName && (
          <Tag icon={<CalendarOutlined />} color="processing" style={{ margin: 0 }}>
            {activeSessionName}
            {activeSemesterName ? ` • ${activeSemesterName}` : ""}
          </Tag>
        )}
      </Flex>

      {/* Page-Level Freshness & Coordinated Refetch Button */}
      <Flex align="center" gap={8}>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, whiteSpace: "nowrap" }}
        >
          Updated {lastUpdatedText}
        </Typography.Text>
        <Tooltip title="Refresh metrics">
          <Button
            type="text"
            size="small"
            icon={<ReloadOutlined spin={isFetching} />}
            disabled={isFetching}
            onClick={onRefresh}
            aria-label="Refresh dashboard data"
          />
        </Tooltip>
      </Flex>
    </Flex>
  );
};
