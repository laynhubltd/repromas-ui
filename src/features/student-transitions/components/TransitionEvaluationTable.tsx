import type { StudentTransitionStatus } from "@/features/settings/tabs/student-transition-status/types/student-transition-status";
import { HistoryOutlined } from "@ant-design/icons";
import { Button, Flex, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type {
  StagedOverride,
  StudentResultItemDTO,
} from "../types/student-transition-evaluation";
import { DeferredReasonTooltip } from "./DeferredReasonTooltip";
import { TransitionOverrideSelect } from "./TransitionOverrideSelect";
import { TransitionStatusBadge } from "./TransitionStatusBadge";

export interface TransitionEvaluationTableProps {
  students: StudentResultItemDTO[];
  totalItems: number;
  page: number;
  itemsPerPage: number;
  isLoading: boolean;
  availableStatuses: StudentTransitionStatus[];
  overridesMap: Record<number, StagedOverride>;
  onPageChange: (page: number, pageSize: number) => void;
  onSetOverride: (override: StagedOverride) => void;
  onRemoveOverride: (studentId: number) => void;
  onInspectStudent: (student: StudentResultItemDTO) => void;
}

export function TransitionEvaluationTable({
  students,
  totalItems,
  page,
  itemsPerPage,
  isLoading,
  availableStatuses,
  overridesMap,
  onPageChange,
  onSetOverride,
  onRemoveOverride,
  onInspectStudent,
}: TransitionEvaluationTableProps) {
  const statusMap = Object.fromEntries(availableStatuses.map((s) => [s.id, s.name]));

  const columns: ColumnsType<StudentResultItemDTO> = [
    {
      title: "Student",
      key: "student",
      fixed: "left",
      width: 220,
      render: (_, r) => (
        <Flex vertical gap={2}>
          <Typography.Text strong>{r.fullName}</Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {r.matricNumber}
          </Typography.Text>
          <Flex wrap="wrap" gap={4} style={{ marginTop: 2 }}>
            {r.currentTransition.isSpillover && (
              <Tag color="magenta" style={{ fontSize: 10, margin: 0 }}>
                Spillover
              </Tag>
            )}
            {r.currentTransition.hasExhaustedMaxResidency && (
              <Tag color="error" style={{ fontSize: 10, margin: 0 }}>
                Max Residency Reached
              </Tag>
            )}
          </Flex>
        </Flex>
      ),
    },
    {
      title: "Semester Performance",
      key: "performance",
      width: 200,
      render: (_, r) => (
        <Flex vertical gap={2} style={{ fontSize: 12 }}>
          <Flex justify="space-between">
            <Typography.Text type="secondary">TCU / TNP:</Typography.Text>
            <Typography.Text strong>
              {r.summary.tcu} / {r.summary.tnp.toFixed(1)}
            </Typography.Text>
          </Flex>
          <Flex justify="space-between">
            <Typography.Text type="secondary">GPA / CGPA:</Typography.Text>
            <Typography.Text strong style={{ color: "#1677ff" }}>
              {r.summary.gpa.toFixed(2)} / {r.summary.cgpa.toFixed(2)}
            </Typography.Text>
          </Flex>
          <Flex justify="space-between">
            <Typography.Text type="secondary">Earned Units:</Typography.Text>
            <Typography.Text>{r.summary.totalEarnedUnits} Units</Typography.Text>
          </Flex>
          {r.summary.unclearedCarryovers && r.summary.unclearedCarryovers.length > 0 && (
            <Flex wrap="wrap" gap={2} style={{ marginTop: 2 }}>
              <Typography.Text type="danger" style={{ fontSize: 10 }}>
                Carryovers:
              </Typography.Text>
              {r.summary.unclearedCarryovers.map((code) => (
                <Tag key={code} color="error" style={{ fontSize: 10, margin: 0, padding: "0 2px" }}>
                  {code}
                </Tag>
              ))}
            </Flex>
          )}
        </Flex>
      ),
    },
    {
      title: "Current Standing",
      key: "currentStanding",
      width: 160,
      render: (_, r) => (
        <Flex vertical gap={2}>
          <TransitionStatusBadge
            statusName={r.currentTransition.status || "Unassigned"}
            standingCategory={r.currentTransition.standing || "NEUTRAL"}
          />
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Level: {r.currentTransition.levelName || "—"}
          </Typography.Text>
        </Flex>
      ),
    },
    {
      title: "Evaluated Recommendation",
      key: "evaluated",
      width: 220,
      render: (_, r) => {
        if (!r.summary.isActionable) {
          return (
            <DeferredReasonTooltip
              standingLabel={r.summary.academicStanding}
              deferralReason={r.summary.deferralReason}
            />
          );
        }

        const resolvedStatusName =
          r.summary.recommendedTransitionStatusId !== null
            ? statusMap[r.summary.recommendedTransitionStatusId] ?? r.summary.academicStanding
            : r.summary.academicStanding;

        return (
          <TransitionStatusBadge
            statusName={resolvedStatusName}
            standingCategory={r.currentTransition.standing || "NEUTRAL"}
            transitionReason={r.summary.transitionReason}
            remark={r.summary.remark}
          />
        );
      },
    },
    {
      title: "Target Standing / Admin Override",
      key: "override",
      width: 220,
      render: (_, r) => {
        const recommendedName =
          r.summary.recommendedTransitionStatusId !== null
            ? statusMap[r.summary.recommendedTransitionStatusId] ?? r.summary.academicStanding
            : r.summary.academicStanding;

        return (
          <TransitionOverrideSelect
            studentId={r.studentId}
            matricNumber={r.matricNumber}
            fullName={r.fullName}
            recommendedStatusId={r.summary.recommendedTransitionStatusId}
            recommendedStatusName={recommendedName}
            currentOverride={overridesMap[r.studentId]}
            availableStatuses={availableStatuses}
            disabled={!r.summary.isActionable}
            onSetOverride={onSetOverride}
            onRemoveOverride={onRemoveOverride}
          />
        );
      },
    },
    {
      title: "Actions",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, r) => (
        <Button
          type="text"
          size="small"
          icon={<HistoryOutlined />}
          title="Inspect Student Transition History"
          onClick={() => onInspectStudent(r)}
        />
      ),
    },
  ];

  return (
    <Table
      size="middle"
      columns={columns}
      dataSource={students}
      rowKey="studentId"
      loading={isLoading}
      scroll={{ x: 1000 }}
      pagination={{
        current: page,
        pageSize: itemsPerPage,
        total: totalItems,
        showSizeChanger: true,
        pageSizeOptions: ["10", "20", "50", "100"],
        onChange: onPageChange,
      }}
    />
  );
}
