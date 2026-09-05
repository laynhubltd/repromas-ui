// Feature: assessment
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import {
  CalendarOutlined,
  ScheduleOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Divider, Flex, Typography } from "antd";
import type { ScoreSheetMeta as ScoreSheetMetaType } from "../types/score-sheet";

type ScoreSheetMetaProps = {
  meta: ScoreSheetMetaType;
  studentCount: number;
};

export function ScoreSheetMeta({ meta, studentCount }: ScoreSheetMetaProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  const semesterDisplay = meta.ordinalName ?? meta.semesterTitle ?? meta.semesterName;

  return (
    <div
      style={{
        padding: `${token.paddingSM}px ${token.paddingMD}px`,
        background: token.colorBgContainer,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
      }}
    >
      <Flex
        vertical={isMobile}
        align={isMobile ? "stretch" : "center"}
        justify="space-between"
        gap={isMobile ? token.marginSM : token.marginMD}
      >
        {/* ── Course identity ── */}
        <Flex
          vertical={isMobile}
          align={isMobile ? "flex-start" : "center"}
          gap={isMobile ? 2 : token.marginSM}
          style={{ minWidth: 0 }}
        >
          <Typography.Text
            strong
            style={{
              fontSize: isMobile ? token.fontSizeLG : token.fontSizeXL,
              color: token.colorPrimary,
              letterSpacing: "0.02em",
              whiteSpace: "nowrap",
            }}
          >
            {meta.courseCode}
          </Typography.Text>

          {!isMobile && (
            <div
              style={{
                width: 1,
                height: 20,
                background: token.colorBorderSecondary,
                flexShrink: 0,
              }}
            />
          )}

          <Typography.Text
            style={{
              fontSize: isMobile ? token.fontSize : token.fontSizeLG,
              color: token.colorText,
              fontWeight: token.fontWeightStrong,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: isMobile ? "normal" : "nowrap",
            }}
          >
            {meta.courseName}
          </Typography.Text>
        </Flex>

        {/* ── Stat chips ── */}
        {isMobile ? (
          // Mobile: chips in a scrollable horizontal row + student count badge below
          <Flex vertical gap={token.marginXS}>
            {/* Scrollable chip row */}
            <div
              style={{
                overflowX: "auto",
                WebkitOverflowScrolling: "touch",
                paddingBottom: 2, // prevent clipping scrollbar
              }}
            >
              <Flex gap={token.marginXS} style={{ width: "max-content" }}>
                <StatPill
                  icon={<CalendarOutlined />}
                  label="Session"
                  value={meta.sessionName}
                  token={token}
                />
                <StatPill
                  icon={<ScheduleOutlined />}
                  label="Semester"
                  value={semesterDisplay}
                  token={token}
                />
              </Flex>
            </div>

            {/* Student count — full-width badge on mobile */}
            <StudentCountBadge count={studentCount} fullWidth token={token} />
          </Flex>
        ) : (
          // Desktop: inline chips with dividers + student count pill
          <Flex align="center" gap={0} wrap="wrap">
            <StatChip
              icon={<CalendarOutlined />}
              label="Session"
              value={meta.sessionName}
              token={token}
            />
            <Divider
              type="vertical"
              style={{ height: 36, margin: `0 ${token.marginSM}px` }}
            />
            <StatChip
              icon={<ScheduleOutlined />}
              label="Semester"
              value={semesterDisplay}
              token={token}
            />
            <Divider
              type="vertical"
              style={{ height: 36, margin: `0 ${token.marginSM}px` }}
            />
            <StudentCountBadge count={studentCount} token={token} />
          </Flex>
        )}
      </Flex>
    </div>
  );
}

// ─── Desktop stat chip (label + value stacked) ────────────────────────────────

type StatChipProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  token: ReturnType<typeof useToken>;
};

function StatChip({ icon, label, value, token }: StatChipProps) {
  return (
    <Flex vertical gap={2} style={{ padding: `2px ${token.paddingXS}px` }}>
      <Typography.Text
        style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}
      >
        {icon} {label}
      </Typography.Text>
      <Typography.Text
        strong
        style={{ fontSize: token.fontSize, color: token.colorText }}
      >
        {value}
      </Typography.Text>
    </Flex>
  );
}

// ─── Mobile stat pill (compact horizontal badge) ──────────────────────────────

type StatPillProps = {
  icon: React.ReactNode;
  label: string;
  value: string;
  token: ReturnType<typeof useToken>;
};

function StatPill({ icon, label, value, token }: StatPillProps) {
  return (
    <Flex
      align="center"
      gap={token.marginXS}
      style={{
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        background: token.colorFillAlter,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        whiteSpace: "nowrap",
      }}
    >
      <Typography.Text
        style={{ fontSize: token.fontSizeSM, color: token.colorTextTertiary }}
      >
        {icon}
      </Typography.Text>
      <Flex vertical gap={0}>
        <Typography.Text
          style={{
            fontSize: 10,
            color: token.colorTextTertiary,
            lineHeight: 1.2,
          }}
        >
          {label}
        </Typography.Text>
        <Typography.Text
          strong
          style={{
            fontSize: token.fontSizeSM,
            color: token.colorText,
            lineHeight: 1.3,
          }}
        >
          {value}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}

// ─── Student count badge ──────────────────────────────────────────────────────

type StudentCountBadgeProps = {
  count: number;
  fullWidth?: boolean;
  token: ReturnType<typeof useToken>;
};

function StudentCountBadge({
  count,
  fullWidth = false,
  token,
}: StudentCountBadgeProps) {
  const hasStudents = count > 0;

  return (
    <Flex
      align="center"
      justify={fullWidth ? "space-between" : "center"}
      gap={token.marginSM}
      style={{
        padding: `${token.paddingXS}px ${token.paddingSM}px`,
        background: hasStudents ? token.colorPrimaryBg : token.colorFillAlter,
        border: `1px solid ${hasStudents ? token.colorPrimaryBorder : token.colorBorderSecondary}`,
        borderRadius: token.borderRadiusLG,
        ...(fullWidth ? { width: "100%" } : {}),
      }}
    >
      <Flex align="center" gap={token.marginXS}>
        <TeamOutlined
          style={{
            fontSize: token.fontSize,
            color: hasStudents ? token.colorPrimary : token.colorTextTertiary,
          }}
        />
        <Typography.Text
          style={{
            fontSize: token.fontSizeSM,
            color: token.colorTextSecondary,
          }}
        >
          Students
        </Typography.Text>
      </Flex>
      <Typography.Text
        strong
        style={{
          fontSize: token.fontSizeLG,
          fontWeight: 700,
          color: hasStudents ? token.colorPrimary : token.colorTextTertiary,
          lineHeight: 1,
        }}
      >
        {count}
      </Typography.Text>
    </Flex>
  );
}
