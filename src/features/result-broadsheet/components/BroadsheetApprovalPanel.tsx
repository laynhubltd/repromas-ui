// Feature: result-broadsheet
import { WorkflowStatusBar } from "@/features/approval-workflow";
import { useToken } from "@/shared/hooks/useToken";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Alert, Flex, Progress, Tag, Typography } from "antd";
import type { CohortBroadsheetApproval } from "../types/result-broadsheet";

type BroadsheetApprovalPanelProps = {
  approval: CohortBroadsheetApproval | null;
};

export function BroadsheetApprovalPanel({
  approval,
}: BroadsheetApprovalPanelProps) {
  const token = useToken();

  if (!approval) return null;

  const total = approval.totalSheetsCount || 0;
  const approved = approval.approvedSheetsCount || 0;
  const isComplete = total > 0 && approved === total;
  const percent = total > 0 ? Math.round((approved / total) * 100) : 0;
  const hasLaggards = Boolean(approval.laggards && approval.laggards.length > 0);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: token.marginSM,
      }}
    >
      {/* ── Completeness Gate: Passed State (100% Complete) ── */}
      <ConditionalRenderer when={isComplete}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: token.marginXS,
            padding: `${token.paddingXXS + 2}px ${token.paddingSM}px`,
            background: token.colorSuccessBg,
            border: `1px solid ${token.colorSuccessBorder}`,
            borderRadius: token.borderRadiusLG,
            fontSize: token.fontSizeSM,
          }}
        >
          <Flex align="center" gap={token.marginXS}>
            <CheckCircleOutlined style={{ color: token.colorSuccess }} />
            <Typography.Text strong style={{ color: token.colorSuccessText, fontSize: token.fontSizeSM }}>
              Course Score Sheets Completeness Gate Passed
            </Typography.Text>
            <Tag color="success" style={{ marginInlineEnd: 0, fontSize: token.fontSizeSM - 1 }}>
              {approved}/{total} Score Sheets Approved (100%)
            </Tag>
          </Flex>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM - 1 }}>
            All course scores finalized & verified for cohort workflow progression.
          </Typography.Text>
        </div>
      </ConditionalRenderer>

      {/* ── Completeness Gate: Pending / Incomplete State ── */}
      <ConditionalRenderer when={!isComplete}>
        <Alert
          type="warning"
          showIcon
          icon={<ExclamationCircleOutlined />}
          style={{
            padding: "8px 12px",
            borderRadius: token.borderRadiusLG,
          }}
          title={
            <Flex justify="space-between" align="center" wrap="wrap" gap={token.marginXS}>
              <span>
                <strong>Course Score Sheets Completeness Gate</strong>: {approved} of {total} score sheets approved ({percent}%)
              </span>
              <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                All course score sheets must be finalized before cohort submission.
              </Typography.Text>
            </Flex>
          }
          description={
            hasLaggards ? (
              <div style={{ marginTop: token.marginXS }}>
                <Progress
                  percent={percent}
                  size="small"
                  status="active"
                  strokeColor={token.colorPrimary}
                  style={{ marginBottom: token.marginXS }}
                />
                <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                  {approval.laggards?.map((item, idx) => {
                    if (typeof item === "string") {
                      return (
                        <li key={idx} style={{ marginBottom: 2 }}>
                          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                            {item}
                          </Typography.Text>
                        </li>
                      );
                    }

                    const code = item.courseCode || "";
                    const courseTitle = item.courseTitle || "";
                    const status = item.statusLabel || item.status || "";
                    const credits = item.creditUnits ? `${item.creditUnits} CU` : "";
                    const gradedInfo =
                      item.registeredStudentsCount !== undefined &&
                      item.gradedStudentsCount !== undefined
                        ? `(${item.gradedStudentsCount}/${item.registeredStudentsCount} graded)`
                        : "";

                    return (
                      <li key={item.courseConfigId ?? idx} style={{ marginBottom: 2 }}>
                        <Flex align="center" gap={token.marginXS} wrap="wrap">
                          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
                            {code}
                          </Typography.Text>
                          <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                            — {courseTitle}
                          </Typography.Text>
                          {credits && (
                            <Tag style={{ marginInlineEnd: 0, fontSize: token.fontSizeSM - 1 }}>
                              {credits}
                            </Tag>
                          )}
                          {status && (
                            <Tag
                              color={status === "PUBLISHED" ? "success" : "warning"}
                              style={{ marginInlineEnd: 0, fontSize: token.fontSizeSM - 1 }}
                            >
                              {status}
                            </Tag>
                          )}
                          {gradedInfo && (
                            <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                              {gradedInfo}
                            </Typography.Text>
                          )}
                        </Flex>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : undefined
          }
        />
      </ConditionalRenderer>

      {/* ── Workflow Status Bar & Approval Actions ── */}
      <WorkflowStatusBar
        targetEntity="COHORT_BROADSHEET"
        targetId={approval.id}
        targetTag={ApiTagTypes.BroadsheetReport}
      />
    </div>
  );
}
