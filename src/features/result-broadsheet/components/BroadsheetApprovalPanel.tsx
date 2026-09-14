// Feature: result-broadsheet
import { WorkflowStatusBar } from "@/features/approval-workflow";
import { useToken } from "@/shared/hooks/useToken";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  CheckCircleOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Alert, Flex, Progress, Typography } from "antd";
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
        marginBottom: token.marginMD,
      }}
    >
      {/* ── Completeness Meter (Pre-submission context) ── */}
      <div
        style={{
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: token.borderRadiusLG,
        }}
      >
        <Flex
          justify="space-between"
          align="center"
          wrap="wrap"
          gap={token.marginSM}
          style={{ marginBottom: token.marginXS }}
        >
          <Flex align="center" gap={token.marginXS}>
            {isComplete ? (
              <CheckCircleOutlined style={{ color: token.colorSuccess }} />
            ) : (
              <ExclamationCircleOutlined style={{ color: token.colorWarning }} />
            )}
            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              Course Score Sheets Completeness Gate
            </Typography.Text>
          </Flex>

          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            <strong>{approved}</strong> of <strong>{total}</strong> course score sheets approved ({percent}%)
          </Typography.Text>
        </Flex>

        <Progress
          percent={percent}
          status={isComplete ? "success" : "active"}
          strokeColor={isComplete ? token.colorSuccess : token.colorPrimary}
        />

        {/* Laggards Warning */}
        <ConditionalRenderer when={hasLaggards && !isComplete}>
          <Alert
            type="warning"
            showIcon
            style={{ marginTop: token.marginSM }}
            message={
              <span>
                <strong>Unapproved Course Score Sheets</strong> — All course score sheets must be finalized before broadsheet submission.
              </span>
            }
            description={
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {approval.laggards?.map((courseName, idx) => (
                  <li key={idx}>
                    <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                      {courseName}
                    </Typography.Text>
                  </li>
                ))}
              </ul>
            }
          />
        </ConditionalRenderer>
      </div>

      {/* ── Workflow Status Bar & Approval Actions ── */}
      <WorkflowStatusBar
        targetEntity="COHORT_BROADSHEET"
        targetId={approval.id}
        targetTag={ApiTagTypes.BroadsheetReport}
      />
    </div>
  );
}
