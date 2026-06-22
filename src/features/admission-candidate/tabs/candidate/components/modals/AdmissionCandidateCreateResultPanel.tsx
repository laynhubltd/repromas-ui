import { appPaths } from "@/app/routing/app-path";
import { ADMISSION_CANDIDATE_CREATE_UI_COPY } from "@/shared/constants/admissionCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { WarningOutlined } from "@ant-design/icons";
import { Alert, Card, Flex, List, Typography } from "antd";
import { Link } from "react-router-dom";
import type { CreateAdmissionCandidateResponse } from "../../types/admission-candidate";
import {
  formatApplicationStatusLabel,
  formatCapsWarningMessage,
} from "../../utils/capsWarningDisplay";

type AdmissionCandidateCreateResultPanelProps = {
  result: CreateAdmissionCandidateResponse;
  programLabel: string;
  showBillingHint: boolean;
  hasWarnings: boolean;
};

export function AdmissionCandidateCreateResultPanel({
  result,
  programLabel,
  showBillingHint,
  hasWarnings,
}: AdmissionCandidateCreateResultPanelProps) {
  const token = useToken();
  const { candidate, application, jambScores, warnings } = result;
  const scoreCount = jambScores?.length ?? 0;

  return (
    <Flex vertical gap={16}>
      <Typography.Title level={5} style={{ marginTop: 0 }}>
        {candidate.firstName} {candidate.lastName}
        {candidate.jambRegNo ? (
          <Typography.Text type="secondary" style={{ marginLeft: 8 }}>
            ({candidate.jambRegNo})
          </Typography.Text>
        ) : null}
      </Typography.Title>

      <Card
        size="small"
        title={ADMISSION_CANDIDATE_CREATE_UI_COPY.resultApplication}
      >
        {application ? (
          <Flex vertical gap={4}>
            <Typography.Text>{programLabel}</Typography.Text>
            <Typography.Text type="secondary">
              Status:{" "}
              {formatApplicationStatusLabel(application.applicationStatus)}
            </Typography.Text>
          </Flex>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        )}
      </Card>

      <Card
        size="small"
        title={ADMISSION_CANDIDATE_CREATE_UI_COPY.resultJambScores}
      >
        <Typography.Text>
          {scoreCount > 0
            ? ADMISSION_CANDIDATE_CREATE_UI_COPY.resultScoresRecorded.replace(
                "{count}",
                String(scoreCount),
              )
            : ADMISSION_CANDIDATE_CREATE_UI_COPY.resultScoresNone}
        </Typography.Text>
      </Card>

      <ConditionalRenderer when={hasWarnings}>
        <Alert
          type="warning"
          showIcon
          icon={<WarningOutlined />}
          message={ADMISSION_CANDIDATE_CREATE_UI_COPY.resultWarningsTitle}
          description={
            <List
              size="small"
              dataSource={warnings}
              renderItem={(issue) => (
                <List.Item style={{ padding: "4px 0", border: "none" }}>
                  <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                    {formatCapsWarningMessage(issue)}
                  </Typography.Text>
                </List.Item>
              )}
            />
          }
        />
      </ConditionalRenderer>

      <ConditionalRenderer when={showBillingHint}>
        <Alert
          type="info"
          showIcon
          message={
            <span>
              {ADMISSION_CANDIDATE_CREATE_UI_COPY.billingHint}{" "}
              <Link to={appPaths.billing}>Open Billing</Link>
            </span>
          }
        />
      </ConditionalRenderer>
    </Flex>
  );
}
