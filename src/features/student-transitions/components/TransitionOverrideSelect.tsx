import type { StudentTransitionStatus } from "@/features/settings/tabs/student-transition-status/types/student-transition-status";
import { useToken } from "@/shared/hooks/useToken";
import { UndoOutlined } from "@ant-design/icons";
import { Button, Flex, Select, Space, Tag, Typography } from "antd";
import { useMemo } from "react";
import type { StagedOverride } from "../types/student-transition-evaluation";

export interface TransitionOverrideSelectProps {
  studentId: number;
  matricNumber: string;
  fullName: string;
  recommendedStatusId: number | null;
  recommendedStatusName: string;
  currentOverride: StagedOverride | undefined;
  availableStatuses: StudentTransitionStatus[];
  disabled?: boolean;
  onSetOverride: (override: StagedOverride) => void;
  onRemoveOverride: (studentId: number) => void;
}

export function TransitionOverrideSelect({
  studentId,
  matricNumber,
  fullName,
  recommendedStatusId,
  recommendedStatusName,
  currentOverride,
  availableStatuses,
  disabled = false,
  onSetOverride,
  onRemoveOverride,
}: TransitionOverrideSelectProps) {
  const token = useToken();

  const isOverridden = currentOverride !== undefined;
  const activeSelectedId = isOverridden
    ? currentOverride.targetStatusId
    : recommendedStatusId ?? undefined;

  // Group available statuses by StateCategory
  const groupedOptions = useMemo(() => {
    const positive = availableStatuses.filter((s) => s.stateCategory === "POSITIVE");
    const neutral = availableStatuses.filter((s) => s.stateCategory === "NEUTRAL");
    const negative = availableStatuses.filter((s) => s.stateCategory === "NEGATIVE");

    return [
      {
        label: <span>Positive Standing</span>,
        options: positive.map((s) => ({ label: s.name, value: s.id })),
      },
      {
        label: <span>Neutral / Special Standing</span>,
        options: neutral.map((s) => ({ label: s.name, value: s.id })),
      },
      {
        label: <span>Negative / Warning Standing</span>,
        options: negative.map((s) => ({ label: s.name, value: s.id })),
      },
    ];
  }, [availableStatuses]);

  const handleChange = (newStatusId: number) => {
    if (newStatusId === recommendedStatusId) {
      // Reverted to recommended
      onRemoveOverride(studentId);
      return;
    }

    const matched = availableStatuses.find((s) => s.id === newStatusId);
    if (matched) {
      onSetOverride({
        studentId,
        targetStatusId: matched.id,
        targetStatusName: matched.name,
        originalStatusName: recommendedStatusName,
        matricNumber,
        fullName,
      });
    }
  };

  return (
    <Space direction="vertical" size={2} style={{ width: "100%" }}>
      <Flex align="center" gap={6}>
        <Select
          size="small"
          disabled={disabled}
          value={activeSelectedId}
          placeholder="Select standing..."
          onChange={handleChange}
          options={groupedOptions}
          style={{
            minWidth: 160,
            ...(isOverridden
              ? {
                  border: `1px solid ${token.colorWarning}`,
                  borderRadius: token.borderRadiusSM,
                }
              : {}),
          }}
        />
        {isOverridden && (
          <Button
            size="small"
            type="text"
            icon={<UndoOutlined style={{ fontSize: 11 }} />}
            title="Revert to evaluated recommendation"
            onClick={() => onRemoveOverride(studentId)}
          />
        )}
      </Flex>
      {isOverridden && (
        <Flex align="center" gap={4}>
          <Tag color="warning" style={{ fontSize: 10, margin: 0, padding: "0 4px" }}>
            Overridden
          </Tag>
          <Typography.Text type="secondary" style={{ fontSize: 11 }}>
            Rec: {recommendedStatusName || "None"}
          </Typography.Text>
        </Flex>
      )}
    </Space>
  );
}
