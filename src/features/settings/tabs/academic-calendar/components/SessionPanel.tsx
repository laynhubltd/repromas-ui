// Feature: academic-calendar
import type { AccordionItem } from "@/components/ui-kit";
import { Accordion } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { centeredBox, ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
    DeleteOutlined,
    EditOutlined,
    PlusOutlined,
    StarOutlined,
} from "@ant-design/icons";
import { Button, Grid, Tag, Tooltip, Typography } from "antd";
import type { AcademicSession, Semester, SemesterType } from "../types/academic-calendar";
import { STATUS_ADVANCE_LABEL, STATUS_BADGE_COLOR } from "../utils/validators";

const { useBreakpoint } = Grid;

export type SessionPanelProps = {
  sessions: AcademicSession[];
  sessionsLoading: boolean;
  sessionsError: boolean;
  semesterTypes: SemesterType[];
  refetchSessions: () => void;
  onOpenCreateSession: () => void;
  onOpenEditSession: (s: AcademicSession) => void;
  onOpenDeleteSession: (s: AcademicSession) => void;
  onSetCurrentSession: (id: number) => Promise<void>;
  onOpenCreateSemester: (sessionId: number) => void;
  onOpenEditSemester: (sem: Semester) => void;
  onOpenDeleteSemester: (sem: Semester) => void;
  onAdvanceSemesterStatus: (sem: Semester) => Promise<void>;
  onSetCurrentSemester: (id: number) => Promise<void>;
};

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return "No dates set";
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  if (startDate && endDate) return `${fmt(startDate)} – ${fmt(endDate)}`;
  if (startDate) return `From ${fmt(startDate)}`;
  return `Until ${fmt(endDate!)}`;
}

export function SessionPanel({
  sessions,
  sessionsLoading,
  sessionsError,
  semesterTypes,
  refetchSessions,
  onOpenCreateSession,
  onOpenEditSession,
  onOpenDeleteSession,
  onSetCurrentSession,
  onOpenCreateSemester,
  onOpenEditSemester,
  onOpenDeleteSemester,
  onAdvanceSemesterStatus,
  onSetCurrentSemester,
}: SessionPanelProps) {
  const token = useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const accordionItems: AccordionItem[] = sessions.map((session) => ({
    key: String(session.id),
    title: (
      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <Typography.Text strong>{session.name}</Typography.Text>
        {session.isCurrent && (
          <Tag color="green" style={{ margin: 0 }}>
            Current
          </Tag>
        )}
      </span>
    ),
    subtitle: formatDateRange(session.startDate, session.endDate),
    extra: (
      <div
        style={{ display: "flex", alignItems: "center", gap: 6 }}
        onClick={(e) => e.stopPropagation()}
      >
        <PermissionGuard permission={Permission.AcademicSessionsManage}>
          <Button
            size="small"
            icon={<StarOutlined />}
            disabled={session.isCurrent}
            onClick={() => onSetCurrentSession(session.id)}
          >
            {isMobile ? null : "Set as Current"}
          </Button>
        </PermissionGuard>
        <PermissionGuard permission={Permission.AcademicSessionsUpdate}>
          <Button
            size="small"
            icon={<EditOutlined />}
            onClick={() => onOpenEditSession(session)}
          />
        </PermissionGuard>
        <PermissionGuard permission={Permission.AcademicSessionsDelete}>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onOpenDeleteSession(session)}
          />
        </PermissionGuard>
      </div>
    ),
    content: (
      <SessionContent
        session={session}
        semesterTypes={semesterTypes}
        isMobile={isMobile}
        onOpenCreateSemester={onOpenCreateSemester}
        onOpenEditSemester={onOpenEditSemester}
        onOpenDeleteSemester={onOpenDeleteSemester}
        onAdvanceSemesterStatus={onAdvanceSemesterStatus}
        onSetCurrentSemester={onSetCurrentSemester}
      />
    ),
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Section header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
        }}
      >
        <Typography.Text strong style={{ fontSize: token.fontSize, color: token.colorText }}>
          Academic Sessions
        </Typography.Text>
        <PermissionGuard permission={Permission.AcademicSessionsCreate}>
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={onOpenCreateSession}
            style={{ fontWeight: 600 }}
          >
            Create Session
          </Button>
        </PermissionGuard>
      </div>

      {/* Content area */}
      <DataLoader
        loading={sessionsLoading}
        loader={<SkeletonRows count={3} variant="card" />}
        minHeight={120}
      >
        {/* Error state */}
        <ConditionalRenderer when={sessionsError}>
          <ErrorAlert
            variant="section"
            error="Failed to load academic sessions"
            onRetry={refetchSessions}
          />
        </ConditionalRenderer>

        {/* Empty state */}
        <ConditionalRenderer
          when={!sessionsError && sessions.length === 0}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
            No academic sessions yet. Create one to get started.
          </Typography.Text>
          <PermissionGuard permission={Permission.AcademicSessionsCreate}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenCreateSession}
              style={{ fontWeight: 600 }}
            >
              Create Session
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* Accordion list */}
        <ConditionalRenderer when={!sessionsError && sessions.length > 0}>
          <Accordion items={accordionItems} expansionMode="multiple" size="md" />
        </ConditionalRenderer>
      </DataLoader>
    </div>
  );
}

// ─── Session Content (semesters list inside accordion) ───────────────────────

type SessionContentProps = {
  session: AcademicSession;
  semesterTypes: SemesterType[];
  isMobile: boolean;
  onOpenCreateSemester: (sessionId: number) => void;
  onOpenEditSemester: (sem: Semester) => void;
  onOpenDeleteSemester: (sem: Semester) => void;
  onAdvanceSemesterStatus: (sem: Semester) => Promise<void>;
  onSetCurrentSemester: (id: number) => Promise<void>;
};

function SessionContent({
  session,
  semesterTypes,
  isMobile,
  onOpenCreateSemester,
  onOpenEditSemester,
  onOpenDeleteSemester,
  onAdvanceSemesterStatus,
  onSetCurrentSemester,
}: SessionContentProps) {
  const token = useToken();

  // null means "not yet loaded" — do not render empty state
  const semesters = session.semesters;
  const semestersLoaded = semesters !== null;
  const hasSemesters = semestersLoaded && semesters.length > 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {/* Semester rows — only render when loaded */}
      {semestersLoaded && (
        <>
          {hasSemesters ? (
            <div
              style={{
                border: `1px solid ${token.colorBorderSecondary}`,
                borderRadius: token.borderRadius,
                overflow: "hidden",
              }}
            >
              {semesters.map((sem, index) => (
                <SemesterRow
                  key={sem.id}
                  semester={sem}
                  semesterTypes={semesterTypes}
                  isMobile={isMobile}
                  isLast={index === semesters.length - 1}
                  onEdit={onOpenEditSemester}
                  onDelete={onOpenDeleteSemester}
                  onAdvanceStatus={onAdvanceSemesterStatus}
                  onSetCurrent={onSetCurrentSemester}
                />
              ))}
            </div>
          ) : (
            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
              No semesters added yet.
            </Typography.Text>
          )}
        </>
      )}

      {/* Add Semester button */}
      <PermissionGuard permission={Permission.SemestersCreate}>
        <Button
          size="small"
          icon={<PlusOutlined />}
          onClick={() => onOpenCreateSemester(session.id)}
          style={{ alignSelf: "flex-start" }}
        >
          Add Semester
        </Button>
      </PermissionGuard>
    </div>
  );
}

// ─── Semester Row ─────────────────────────────────────────────────────────────

type SemesterRowProps = {
  semester: Semester;
  semesterTypes: SemesterType[];
  isMobile: boolean;
  isLast: boolean;
  onEdit: (sem: Semester) => void;
  onDelete: (sem: Semester) => void;
  onAdvanceStatus: (sem: Semester) => Promise<void>;
  onSetCurrent: (id: number) => Promise<void>;
};

function SemesterRow({
  semester,
  semesterTypes,
  isMobile,
  isLast,
  onEdit,
  onDelete,
  onAdvanceStatus,
  onSetCurrent,
}: SemesterRowProps) {
  const token = useToken();

  const semesterTypeName =
    semesterTypes.find((st) => st.id === semester.semesterTypeId)?.name ??
    `Type #${semester.semesterTypeId}`;

  const advanceLabel = STATUS_ADVANCE_LABEL[semester.status];
  const badgeColor = STATUS_BADGE_COLOR[semester.status];
  const borderBottom = isLast ? "none" : `1px solid ${token.colorBorderSecondary}`;

  const actions = (
    <div
      style={{ display: "flex", alignItems: "center", gap: 4, flexShrink: 0 }}
      onClick={(e) => e.stopPropagation()}
    >
      {advanceLabel && (
        <PermissionGuard permission={Permission.SemestersManage}>
          <Tooltip title={advanceLabel}>
            <Button size="small" onClick={() => onAdvanceStatus(semester)}>
              {isMobile ? null : advanceLabel}
            </Button>
          </Tooltip>
        </PermissionGuard>
      )}
      <PermissionGuard permission={Permission.SemestersManage}>
        <Tooltip title={semester.isCurrent ? "Already the current semester" : "Set as Current"}>
          <Button
            size="small"
            icon={<StarOutlined />}
            disabled={semester.isCurrent}
            onClick={() => onSetCurrent(semester.id)}
          />
        </Tooltip>
      </PermissionGuard>
      <PermissionGuard permission={Permission.SemestersUpdate}>
        <Tooltip title="Edit semester">
          <Button size="small" icon={<EditOutlined />} onClick={() => onEdit(semester)} />
        </Tooltip>
      </PermissionGuard>
      <PermissionGuard permission={Permission.SemestersDelete}>
        <Tooltip title="Delete semester">
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => onDelete(semester)}
          />
        </Tooltip>
      </PermissionGuard>
    </div>
  );

  if (isMobile) {
    return (
      <div
        style={{
          padding: "10px 12px",
          borderBottom,
          background: token.colorBgContainer,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            {semesterTypeName}
          </Typography.Text>
          <Tag color={badgeColor} style={{ margin: 0 }}>
            {semester.status}
          </Tag>
          {semester.isCurrent && (
            <Tag color="blue" style={{ margin: 0 }}>
              Current
            </Tag>
          )}
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "10px 12px",
        borderBottom,
        background: token.colorBgContainer,
        gap: 12,
      }}
    >
      {/* Name + badges */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 0 }}>
        <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
          {semesterTypeName}
        </Typography.Text>
        <Tag color={badgeColor} style={{ margin: 0 }}>
          {semester.status}
        </Tag>
        {semester.isCurrent && (
          <Tag color="blue" style={{ margin: 0 }}>
            Current
          </Tag>
        )}
      </div>

      {/* Actions */}
      {actions}
    </div>
  );
}
