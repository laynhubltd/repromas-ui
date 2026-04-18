// Feature: settings-timeframe
import type { AccordionItem } from "@/components/ui-kit";
import { Accordion } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Pagination, Typography } from "antd";
import { useState } from "react";
import { useDeleteSystemTimeFrameMutation, useUpdateSystemTimeFrameMutation } from "../api/systemTimeFramesApi";
import { useSystemTimeFrameTab } from "../hooks/useSystemTimeFrameTab";
import type { EventType, SystemTimeFrame } from "../types/system-timeframe";
import { buildTogglePayload, getAccordionHeaderLabel } from "../utils/displayHelpers";
import { normalizeTimeFrameApiError } from "../utils/validators";
import { DeleteTimeFrameModal } from "./DeleteTimeFrameModal";
import { TimeFrameFilterPanel } from "./TimeFrameFilterPanel";
import { TimeFrameTable } from "./TimeFrameTable";
import { UpsertTimeFrameModal } from "./UpsertTimeFrameModal";

const ITEMS_PER_PAGE = 30;

export function SystemTimeFramesTab() {
  const token = useToken();

  // ── List hook ──────────────────────────────────────────────────────────────
  const {
    groupedTimeFrames,
    isLoading,
    isError,
    filters,
    page,
    totalItems,
    sessions,
    semesters,
    semesterTypes,
    deleteOpen,
    deleteTarget,
    onApplyFilters,
    onClearFilters,
    onPageChange,
    onOpenUpsert,
    onCloseUpsert,
    onOpenDelete,
    onCloseDelete,
    upsertOpen,
    upsertTarget,
  } = useSystemTimeFrameTab();

  // ── Upsert modal hook (drives UpsertTimeFrameModal) ────────────────────────
  // Note: UpsertTimeFrameModal calls useUpsertTimeFrameModal internally.
  // We only need open/target/onClose from the list hook.

  // ── Delete mutation ────────────────────────────────────────────────────────
  const [deleteTimeFrame, { isLoading: isDeleting }] = useDeleteSystemTimeFrameMutation();
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    try {
      await deleteTimeFrame(deleteTarget.id).unwrap();
      onCloseDelete();
    } catch (err) {
      const msg = normalizeTimeFrameApiError(err);
      setDeleteError(msg ?? "Failed to delete time frame. Please try again.");
    }
  };

  const handleCloseDelete = () => {
    setDeleteError(null);
    onCloseDelete();
  };

  // ── Toggle active mutation ─────────────────────────────────────────────────
  const [updateTimeFrame] = useUpdateSystemTimeFrameMutation();
  const [toggleError, setToggleError] = useState<string | null>(null);

  const handleToggleActive = async (record: SystemTimeFrame) => {
    setToggleError(null);
    try {
      await updateTimeFrame(buildTogglePayload(record)).unwrap();
    } catch (err) {
      const msg = normalizeTimeFrameApiError(err);
      setToggleError(msg ?? "Failed to update time frame status.");
    }
  };

  // ── Accordion items ────────────────────────────────────────────────────────
  const eventTypes = Object.keys(groupedTimeFrames) as EventType[];

  const accordionItems: AccordionItem[] = eventTypes.map((eventType) => {
    const group = groupedTimeFrames[eventType];
    return {
      key: eventType,
      title: getAccordionHeaderLabel(eventType, group.length),
      content: (
        <TimeFrameTable
          timeFrames={group}
          isLoading={false}
          isError={false}
          onEdit={(record) => onOpenUpsert(record)}
          onDelete={(record) => onOpenDelete(record)}
          onToggleActive={handleToggleActive}
        />
      ),
    };
  });

  const hasData = eventTypes.length > 0;

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      {/* Header row */}
      <Flex align="center" justify="space-between" gap={12} wrap="wrap">
        <Typography.Title level={5} style={{ margin: 0 }}>
          System Time Frames
        </Typography.Title>
        <Flex gap={8} align="center">
          <TimeFrameFilterPanel
            filters={filters}
            sessions={sessions}
            semesters={semesters}
            semesterTypes={semesterTypes}
            onApply={onApplyFilters}
            onClear={onClearFilters}
          />
          <PermissionGuard permission={Permission.SystemTimeFramesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onOpenUpsert()}
              style={{ fontWeight: 600 }}
            >
              Add Time Frame
            </Button>
          </PermissionGuard>
        </Flex>
      </Flex>

      {/* Toggle error */}
      <ConditionalRenderer when={!!toggleError}>
        <ErrorAlert variant="section" error={toggleError} />
      </ConditionalRenderer>

      {/* Content area */}
      <DataLoader loading={isLoading} loader={<SkeletonRows count={4} variant="card" />}>
        {/* Error state */}
        <ConditionalRenderer when={isError}>
          <ErrorAlert variant="section" error="Failed to load system time frames" />
        </ConditionalRenderer>

        {/* Empty state */}
        <ConditionalRenderer
          when={!isError && !hasData}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No time frames configured yet.
          </Typography.Text>
          <PermissionGuard permission={Permission.SystemTimeFramesCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => onOpenUpsert()}
              style={{ fontWeight: 600 }}
            >
              Add Time Frame
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* Accordion grouped by event type */}
        <ConditionalRenderer when={!isError && hasData}>
          <Accordion items={accordionItems} expansionMode="multiple" size="md" />
        </ConditionalRenderer>
      </DataLoader>

      {/* Pagination */}
      <ConditionalRenderer when={totalItems > ITEMS_PER_PAGE}>
        <Flex justify="flex-end">
          <Pagination
            current={page}
            pageSize={ITEMS_PER_PAGE}
            total={totalItems}
            onChange={onPageChange}
            showSizeChanger={false}
          />
        </Flex>
      </ConditionalRenderer>

      {/* Modals */}
      <UpsertTimeFrameModal
        open={upsertOpen}
        target={upsertTarget}
        onClose={onCloseUpsert}
      />

      <DeleteTimeFrameModal
        open={deleteOpen}
        target={deleteTarget}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        error={deleteError}
      />
    </Flex>
  );
}
