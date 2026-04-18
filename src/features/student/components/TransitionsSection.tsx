// Feature: student-transition
import type { AccordionItem } from "@/components/ui-kit";
import { Accordion } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { centeredBox, ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { DeleteOutlined, EditOutlined, MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Dropdown, Flex, Tag, Typography } from "antd";
import { useTransitionsSection } from "../hooks/useTransitionsSection";
import type { StudentEnrollmentTransition } from "../types/studentTransition";
import { DeleteTransitionModal } from "./modals/DeleteTransitionModal";
import { TransitionFormModal } from "./modals/TransitionFormModal";

type TransitionsSectionProps = {
  studentId: number;
};

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Transition Row ───────────────────────────────────────────────────────────

type TransitionRowProps = {
  transition: StudentEnrollmentTransition;
  statusLabel: string;
  semesterLabel: string;
  levelLabel: string;
  isLast: boolean;
  onEdit: (t: StudentEnrollmentTransition) => void;
  onDelete: (t: StudentEnrollmentTransition) => void;
};

function TransitionRow({
  transition,
  statusLabel,
  semesterLabel,
  levelLabel,
  isLast,
  onEdit,
  onDelete,
}: TransitionRowProps) {
  const token = useToken();

  const menuItems = [
    {
      key: "edit",
      label: (
        <PermissionGuard permission={Permission.StudentEnrollmentTransitionsUpdate}>
          <span>Edit</span>
        </PermissionGuard>
      ),
      icon: <EditOutlined />,
      onClick: () => onEdit(transition),
    },
    {
      key: "delete",
      label: (
        <PermissionGuard permission={Permission.StudentEnrollmentTransitionsDelete}>
          <span style={{ color: token.colorError }}>Delete</span>
        </PermissionGuard>
      ),
      icon: <DeleteOutlined style={{ color: token.colorError }} />,
      onClick: () => onDelete(transition),
      danger: true as const,
    },
  ];

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderBottom: isLast ? "none" : `1px solid ${token.colorBorderSecondary}`,
        background: token.colorBgContainer,
        gap: 12,
        flexWrap: "wrap",
      }}
    >
      {/* Status badge */}
      <div style={{ flex: "0 0 auto" }}>
        <Tag color="blue" style={{ margin: 0 }}>
          {statusLabel}
        </Tag>
      </div>

      {/* Semester label */}
      <div style={{ flex: "1 1 80px", minWidth: 0 }}>
        <Typography.Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {semesterLabel}
        </Typography.Text>
      </div>

      {/* Level label */}
      <div style={{ flex: "1 1 80px", minWidth: 0 }}>
        <Typography.Text style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>
          {levelLabel}
        </Typography.Text>
      </div>

      {/* Date range */}
      <div style={{ flex: "0 0 auto" }}>
        <Typography.Text style={{ fontSize: token.fontSizeSM, whiteSpace: "nowrap" }}>
          {formatDate(transition.startDate)}
          {" – "}
          {transition.endDate ? formatDate(transition.endDate) : "Ongoing"}
        </Typography.Text>
      </div>

      {/* ⋮ dropdown menu */}
      <div style={{ flex: "0 0 auto" }} onClick={(e) => e.stopPropagation()}>
        <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16 }} />}
            style={{ color: token.colorTextTertiary }}
          />
        </Dropdown>
      </div>
    </div>
  );
}

// ─── Transition Accordion ─────────────────────────────────────────────────────

type TransitionAccordionProps = {
  groupedBySession: Array<{
    sessionId: number;
    sessionLabel: string;
    transitions: StudentEnrollmentTransition[];
    mostRecentStartDate: string;
  }>;
  defaultExpandedKeys: string[];
  statusMap: Record<number, string>;
  semesterMap: Record<number, string>;
  levelMap: Record<number, string>;
  onEdit: (t: StudentEnrollmentTransition) => void;
  onDelete: (t: StudentEnrollmentTransition) => void;
};

function TransitionAccordion({
  groupedBySession,
  defaultExpandedKeys,
  statusMap,
  semesterMap,
  levelMap,
  onEdit,
  onDelete,
}: TransitionAccordionProps) {
  const token = useToken();

  const accordionItems: AccordionItem[] = groupedBySession.map((group) => ({
    key: String(group.sessionId),
    title: group.sessionLabel,
    subtitle: `${group.transitions.length} transition${group.transitions.length !== 1 ? "s" : ""}`,
    content: (
      <div
        style={{
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadius,
          overflow: "hidden",
        }}
      >
        {group.transitions.map((t, index) => (
          <TransitionRow
            key={t.id}
            transition={t}
            statusLabel={statusMap[t.statusId] ?? `Status #${t.statusId}`}
            semesterLabel={semesterMap[t.semesterId] ?? `Semester #${t.semesterId}`}
            levelLabel={levelMap[t.levelId] ?? `Level #${t.levelId}`}
            isLast={index === group.transitions.length - 1}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    ),
  }));

  return (
    <Accordion
      items={accordionItems}
      expansionMode="multiple"
      defaultActiveKeys={defaultExpandedKeys}
      size="md"
    />
  );
}

// ─── TransitionsSection ───────────────────────────────────────────────────────

export function TransitionsSection({ studentId }: TransitionsSectionProps) {
  const token = useToken();
  const { state, actions, flags } = useTransitionsSection(studentId);
  const {
    isLoading,
    isError,
    formTarget,
    deleteTarget,
    formModalOpen,
    deleteModalOpen,
    statusMap,
    semesterMap,
    levelMap,
  } = state;
  const { handleOpenCreate, handleOpenEdit, handleOpenDelete, handleCloseForm, handleCloseDelete, refetch } =
    actions;
  const { hasTransitions, groupedBySession, defaultExpandedKeys } = flags;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Section header */}
      <Flex align="center" justify="space-between" gap={8}>
        <Typography.Text strong style={{ fontSize: token.fontSizeLG, color: token.colorText }}>
          Student Transitions
        </Typography.Text>
        <PermissionGuard permission={Permission.StudentEnrollmentTransitionsCreate}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Add Transition
          </Button>
        </PermissionGuard>
      </Flex>

      {/* Content area */}
      <DataLoader loading={isLoading} loader={<SkeletonRows count={3} variant="card" />}>
        {/* Error state */}
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load enrollment transitions"
            onRetry={refetch}
          />
        </ConditionalRenderer>

        {/* Empty state */}
        <ConditionalRenderer
          when={!isError && !hasTransitions}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary">No enrollment transitions yet.</Typography.Text>
        </ConditionalRenderer>

        {/* Accordion */}
        <ConditionalRenderer when={!isError && hasTransitions}>
          <TransitionAccordion
            groupedBySession={groupedBySession}
            defaultExpandedKeys={defaultExpandedKeys}
            statusMap={statusMap}
            semesterMap={semesterMap}
            levelMap={levelMap}
            onEdit={handleOpenEdit}
            onDelete={handleOpenDelete}
          />
        </ConditionalRenderer>
      </DataLoader>

      {/* Modals */}
      <TransitionFormModal
        open={formModalOpen}
        studentId={studentId}
        target={formTarget}
        onClose={handleCloseForm}
      />
      <DeleteTransitionModal
        open={deleteModalOpen}
        target={deleteTarget}
        studentId={studentId}
        onClose={handleCloseDelete}
      />
    </div>
  );
}
