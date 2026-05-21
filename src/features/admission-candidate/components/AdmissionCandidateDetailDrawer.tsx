import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { EditOutlined, GiftOutlined, UserAddOutlined } from "@ant-design/icons";
import {
  Button,
  Descriptions,
  Drawer,
  Flex,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useAdmissionCandidateDrawer } from "../hooks/useAdmissionCandidateDrawer";
import type {
  AdmissionCandidate,
  AdmissionCandidateJambScore,
} from "../types/admission-candidate";
import {
  getCandidateJambScores,
  resolveJambSubjectName,
  sortJambScores,
} from "../utils/jambScoreDisplay";
import { resolveRelatedName } from "../utils/resolveRelatedLabel";

type AdmissionCandidateDetailDrawerProps = {
  candidateId: number | null;
  open: boolean;
  onClose: () => void;
  onEditMetadata?: () => void;
  onOffer?: (candidate: AdmissionCandidate) => void;
  onMatriculate?: (candidate: AdmissionCandidate) => void;
  canOffer?: (candidate: AdmissionCandidate) => boolean;
  canMatriculate?: (candidate: AdmissionCandidate) => boolean;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function AdmissionCandidateDetailDrawer({
  candidateId,
  open,
  onClose,
  onEditMetadata,
  onOffer,
  onMatriculate,
  canOffer,
  canMatriculate,
}: AdmissionCandidateDetailDrawerProps) {
  const token = useToken();
  const { state, actions } = useAdmissionCandidateDrawer(candidateId, open);
  const { candidate, isLoading, isError } = state;

  const showOffer = candidate && canOffer?.(candidate);
  const showMatriculate = candidate && canMatriculate?.(candidate);

  const jambScoreRows = useMemo(
    () => sortJambScores(getCandidateJambScores(candidate)),
    [candidate],
  );

  const jambScoreColumns: ColumnsType<AdmissionCandidateJambScore> = useMemo(
    () => [
      {
        title: "Subject",
        key: "subject",
        render: (_: unknown, record) => resolveJambSubjectName(record),
      },
      {
        title: "Score",
        dataIndex: "score",
        key: "score",
        width: 100,
        align: "right",
      },
    ],
    [],
  );

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      placement="right"
      title={
        candidate ? (
          <Flex align="center" gap={8}>
            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              {candidate.firstName} {candidate.lastName}
            </Typography.Text>
            <Tag>{candidate.jambRegNo}</Tag>
          </Flex>
        ) : (
          "Candidate Details"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end" wrap="wrap">
          <PermissionGuard permission={Permission.AdmissionCandidatesUpdate}>
            <Button
              icon={<EditOutlined />}
              onClick={onEditMetadata}
              disabled={!candidate}
            >
              Edit Metadata
            </Button>
          </PermissionGuard>
          <PermissionGuard permission={Permission.AdmissionCandidatesManage}>
            <Button
              type="primary"
              icon={<GiftOutlined />}
              onClick={() => candidate && onOffer?.(candidate)}
              disabled={!showOffer}
            >
              Offer
            </Button>
            <Button
              icon={<UserAddOutlined />}
              onClick={() => candidate && onMatriculate?.(candidate)}
              disabled={!showMatriculate}
            >
              Matriculate
            </Button>
          </PermissionGuard>
        </Flex>
      }
      destroyOnHidden
    >
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={5} variant="card" />}
      >
        {isError ? (
          <ErrorAlert
            variant="section"
            error="Failed to load candidate details"
            onRetry={actions.refetch}
          />
        ) : candidate ? (
          <Flex vertical gap={24}>
            <Descriptions
              title="Identity"
              bordered
              size="small"
              column={1}
            >
              <Descriptions.Item label="JAMB Reg. No.">
                {candidate.jambRegNo}
              </Descriptions.Item>
              <Descriptions.Item label="Admission Cycle">
                {resolveRelatedName(candidate.cycle, candidate.cycleId)}
              </Descriptions.Item>
              <Descriptions.Item label="Gender">
                {candidate.gender ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Date of Birth">
                {formatDate(candidate.dateOfBirth)}
              </Descriptions.Item>
              <Descriptions.Item label="State">
                {resolveRelatedName(candidate.state, candidate.stateId)}
              </Descriptions.Item>
              <Descriptions.Item label="LGA">
                {candidate.lgaId != null
                  ? resolveRelatedName(candidate.lga, candidate.lgaId)
                  : "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Entry Mode">
                {candidate.entryMode}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                {candidate.email ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                {candidate.phone ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label="Created">
                {formatDate(candidate.createdAt)}
              </Descriptions.Item>
            </Descriptions>

            {candidate.application && (
              <Descriptions
                title="Application"
                bordered
                size="small"
                column={1}
              >
                <Descriptions.Item label="Status">
                  {candidate.application.applicationStatus}
                </Descriptions.Item>
                <Descriptions.Item label="Final Decision">
                  <Tag
                    color={
                      candidate.application.finalDecision ===
                      "OFFER_ADMISSION"
                        ? "success"
                        : undefined
                    }
                  >
                    {candidate.application.finalDecision}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Applied Program">
                  {candidate.application.appliedProgram?.name ??
                    candidate.application.appliedProgramId}
                </Descriptions.Item>
                <Descriptions.Item label="Offered Program">
                  {candidate.application.offeredProgram?.name ??
                    candidate.application.offeredProgramId ??
                    "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Matriculated">
                  {candidate.application.isMatriculated ? "Yes" : "No"}
                </Descriptions.Item>
              </Descriptions>
            )}

            {candidate.screening && (
              <Descriptions
                title="Screening"
                bordered
                size="small"
                column={1}
              >
                <Descriptions.Item label="JAMB Total">
                  {candidate.screening.jambScore ?? "—"}
                </Descriptions.Item>
                <Descriptions.Item label="School Raw Score">
                  {candidate.screening.schoolRawScore ?? "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Aggregate Score">
                  {candidate.screening.aggregateScore ?? "—"}
                </Descriptions.Item>
              </Descriptions>
            )}

            <div>
              <Typography.Text
                strong
                style={{
                  display: "block",
                  marginBottom: token.paddingSM,
                  fontSize: token.fontSize,
                }}
              >
                JAMB Subject Scores
              </Typography.Text>
              <ConditionalRenderer when={jambScoreRows.length > 0}>
                <Table<AdmissionCandidateJambScore>
                  rowKey="id"
                  dataSource={jambScoreRows}
                  columns={jambScoreColumns}
                  size="small"
                  pagination={false}
                  bordered
                />
              </ConditionalRenderer>
              <ConditionalRenderer when={jambScoreRows.length === 0}>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  No JAMB subject scores recorded for this candidate.
                </Typography.Text>
              </ConditionalRenderer>
            </div>

            <Descriptions title="Metadata" bordered size="small" column={1}>
              <Descriptions.Item label="JSON">
                <Typography.Text
                  code
                  style={{
                    fontSize: token.fontSizeSM,
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                  }}
                >
                  {candidate.metadata
                    ? JSON.stringify(candidate.metadata, null, 2)
                    : "—"}
                </Typography.Text>
              </Descriptions.Item>
            </Descriptions>
          </Flex>
        ) : null}
      </DataLoader>
    </Drawer>
  );
}
