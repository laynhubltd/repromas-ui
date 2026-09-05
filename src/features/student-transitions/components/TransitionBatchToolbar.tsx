import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { Program } from "@/features/program/tabs/programs/types/program";
import type { AcademicSession, SemesterType } from "@/features/settings/tabs/academic-calendar/types/academicCalendar";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import { useToken } from "@/shared/hooks/useToken";
import { CheckCircleOutlined, ExperimentOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Select, Switch, Typography } from "antd";

export interface TransitionBatchToolbarProps {
  sessionOptions: AcademicSession[];
  semesterTypeOptions: SemesterType[];
  programOptions: Program[];
  levelOptions: Level[];
  selectedSessionId: number | null;
  selectedSemesterTypeId: number | null;
  selectedProgramId: number | null;
  selectedLevelId: number | null;
  isTerminal: boolean;
  isSimulating: boolean;
  isFilterComplete: boolean;
  stagedOverridesCount: number;
  onSessionChange: (id: number | null) => void;
  onSemesterTypeChange: (id: number | null) => void;
  onProgramChange: (id: number | null) => void;
  onLevelChange: (id: number | null) => void;
  onTerminalToggle: (checked: boolean) => void;
  onOpenSimulation: () => void;
}

export function TransitionBatchToolbar({
  sessionOptions,
  semesterTypeOptions,
  programOptions,
  levelOptions,
  selectedSessionId,
  selectedSemesterTypeId,
  selectedProgramId,
  selectedLevelId,
  isTerminal,
  isSimulating,
  isFilterComplete,
  stagedOverridesCount,
  onSessionChange,
  onSemesterTypeChange,
  onProgramChange,
  onLevelChange,
  onTerminalToggle,
  onOpenSimulation,
}: TransitionBatchToolbarProps) {
  const token = useToken();

  return (
    <Card
      size="small"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorderSecondary,
      }}
    >
      <Flex justify="space-between" align="center" wrap="wrap" gap={12}>
        {/* Cohort Selectors */}
        <Flex align="center" wrap="wrap" gap={12} flex={1}>
          <Select
            placeholder="Academic Session"
            value={selectedSessionId}
            onChange={onSessionChange}
            style={{ minWidth: 160 }}
            options={sessionOptions.map((s) => ({ label: s.name, value: s.id }))}
            allowClear
          />

          <Select
            placeholder="Semester Type"
            value={selectedSemesterTypeId}
            onChange={onSemesterTypeChange}
            style={{ minWidth: 150 }}
            options={semesterTypeOptions.map((st) => ({ label: st.name, value: st.id }))}
            allowClear
          />

          <Select
            placeholder="Program"
            value={selectedProgramId}
            onChange={onProgramChange}
            style={{ minWidth: 200 }}
            showSearch
            filterOption={(input, option) =>
              (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
            }
            options={programOptions.map((p) => ({ label: p.name, value: p.id }))}
            allowClear
          />

          <Select
            placeholder="Nominal Level"
            value={selectedLevelId}
            onChange={onLevelChange}
            style={{ minWidth: 130 }}
            options={levelOptions.map((l) => ({ label: l.name, value: l.id }))}
            allowClear
          />

          <Flex align="center" gap={6}>
            <Switch
              size="small"
              checked={isTerminal}
              onChange={onTerminalToggle}
            />
            <Typography.Text style={{ fontSize: 12 }}>
              {isTerminal ? "Terminal / Graduated Archives" : "Active Cohort"}
            </Typography.Text>
          </Flex>
        </Flex>

        {/* Primary Action Button */}
        <PermissionGuard permission={Permission.StudentEnrollmentTransitionsManage}>
          <Button
            type="primary"
            icon={<ExperimentOutlined />}
            loading={isSimulating}
            disabled={!isFilterComplete}
            onClick={onOpenSimulation}
            style={{ fontWeight: 600 }}
          >
            Review & Apply Transitions
            {stagedOverridesCount > 0 && ` (${stagedOverridesCount} Overrides)`}
          </Button>
        </PermissionGuard>
      </Flex>
    </Card>
  );
}
