import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import OlevelSittingsSubjectGrade from "@/features/admission-candidate/components/OlevelSittingsSubjectGrade";
import {
  FINAL_DECISION_TAG_COLORS,
  getApplicationStatusLabel,
  getCandidateEntryModeLabel,
  getCandidateGenderLabel,
  getFinalDecisionLabel,
  isRealJambRegNo,
} from "@/shared/constants/admissionCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { MetadataRenderer } from "@/shared/ui/MetadataRenderer";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { GiftOutlined, UserAddOutlined } from "@ant-design/icons";
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
  CandidatePriorQualification,
} from "../types/admission-candidate";
import {
  getCandidateJambScores,
  resolveJambSubjectName,
  sortJambScores,
} from "../utils/jambScoreDisplay";
import { formatPriorQualificationAssessedValue } from "../utils/priorQualificationDisplay";
import { resolveRelatedName } from "../utils/resolveRelatedLabel";

type AdmissionCandidateDetailDrawerProps = {
  candidateId: number | null;
  open: boolean;
  onClose: () => void;
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
  onOffer,
  onMatriculate,
  canOffer,
  canMatriculate,
}: AdmissionCandidateDetailDrawerProps) {
  const token = useToken();
  const { state, actions } = useAdmissionCandidateDrawer(candidateId, open);
  const {
    candidate,
    priorQualifications,
    isLoadingPriorQualifications,
    isLoading,
    isError,
  } = state;

  const showOffer = candidate && canOffer?.(candidate);
  const showMatriculate = candidate && canMatriculate?.(candidate);
  const supportsPriorQualifications =
    candidate?.entryMode === "DIRECT_ENTRY" ||
    candidate?.entryMode === "TRANSFER";

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

  const priorQualificationColumns: ColumnsType<CandidatePriorQualification> =
    useMemo(
      () => [
        {
          title: "Qualification Type",
          key: "qualificationType",
          render: (_: unknown, record) =>
            record.priorQualificationType?.name ??
            record.priorQualificationType?.code ??
            "—",
        },
        {
          title: "Institution",
          dataIndex: "institutionName",
          key: "institutionName",
        },
        {
          title: "Matriculation No",
          dataIndex: "matriculationNumber",
          key: "matriculationNumber",
          render: (val: string | null) => val ?? "—",
        },
        {
          title: "Year Awarded",
          dataIndex: "yearAwarded",
          key: "yearAwarded",
          width: 110,
        },
        {
          title: "Result",
          key: "result",
          render: (_: unknown, record) =>
            formatPriorQualificationAssessedValue(record),
        },
        {
          title: "Verification",
          dataIndex: "verificationStatus",
          key: "verificationStatus",
          render: (status: string) => <Tag>{status}</Tag>,
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
          <Flex align="center" gap={8} wrap="wrap">
            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              {candidate.firstName} {candidate.lastName}
            </Typography.Text>
            <Tag color="blue">
              {getCandidateEntryModeLabel(candidate.entryMode)}
            </Tag>
            <ConditionalRenderer when={isRealJambRegNo(candidate.jambRegNo)}>
              <Tag>{candidate.jambRegNo}</Tag>
            </ConditionalRenderer>
          </Flex>
        ) : (
          "Candidate Details"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end" wrap="wrap">
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
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load candidate details"
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={!isError && candidate !== null}>
          {candidate ? (
            <Flex vertical gap={24}>
              <Descriptions title="Identity" bordered size="small" column={1}>
                <Descriptions.Item label="JAMB Reg. No.">
                  {isRealJambRegNo(candidate.jambRegNo)
                    ? candidate.jambRegNo
                    : "—"}
                </Descriptions.Item>
                <Descriptions.Item label="Admission Cycle">
                  {resolveRelatedName(candidate.cycle, candidate.cycleId)}
                </Descriptions.Item>
                <Descriptions.Item label="Gender">
                  {getCandidateGenderLabel(candidate.gender)}
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
                  {getCandidateEntryModeLabel(candidate.entryMode)}
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

              <ConditionalRenderer when={Boolean(candidate.application)}>
                <Descriptions
                  title="Application"
                  bordered
                  size="small"
                  column={1}
                >
                  <Descriptions.Item label="Status">
                    {getApplicationStatusLabel(
                      candidate.application?.applicationStatus,
                    )}
                  </Descriptions.Item>
                  <Descriptions.Item label="Final Decision">
                    <Tag
                      color={
                        FINAL_DECISION_TAG_COLORS[
                          candidate.application?.finalDecision ?? ""
                        ]
                      }
                    >
                      {getFinalDecisionLabel(
                        candidate.application?.finalDecision,
                      )}
                    </Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Applied Program">
                    {candidate.application?.appliedProgram?.name ??
                      candidate.application?.appliedProgramId}
                  </Descriptions.Item>
                  <Descriptions.Item label="Offered Program">
                    {candidate.application?.offeredProgram?.name ??
                      candidate.application?.offeredProgramId ??
                      "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Matriculated">
                    {candidate.application?.isMatriculated ? "Yes" : "No"}
                  </Descriptions.Item>
                </Descriptions>
              </ConditionalRenderer>

              <ConditionalRenderer when={Boolean(candidate.screening)}>
                <Descriptions title="Screening" bordered size="small" column={1}>
                  <Descriptions.Item label="JAMB Total">
                    {candidate.screening?.jambScore ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="School Raw Score">
                    {candidate.screening?.schoolRawScore ?? "—"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Aggregate Score">
                    {candidate.screening?.aggregateScore ?? "—"}
                  </Descriptions.Item>
                </Descriptions>
              </ConditionalRenderer>

              <ConditionalRenderer when={supportsPriorQualifications}>
                <div>
                  <Typography.Text
                    strong
                    style={{
                      display: "block",
                      marginBottom: token.paddingSM,
                      fontSize: token.fontSize,
                    }}
                  >
                    Prior Qualifications
                  </Typography.Text>
                  <DataLoader
                    loading={isLoadingPriorQualifications}
                    loader={<SkeletonRows count={2} />}
                  >
                    <ConditionalRenderer when={priorQualifications.length > 0}>
                      <Table<CandidatePriorQualification>
                        rowKey="id"
                        dataSource={priorQualifications}
                        columns={priorQualificationColumns}
                        size="small"
                        pagination={false}
                        bordered
                        scroll={{ x: "max-content" }}
                      />
                    </ConditionalRenderer>
                    <ConditionalRenderer
                      when={priorQualifications.length === 0}
                    >
                      <Typography.Text
                        type="secondary"
                        style={{ fontSize: token.fontSizeSM }}
                      >
                        No prior qualifications recorded for this candidate.
                      </Typography.Text>
                    </ConditionalRenderer>
                  </DataLoader>
                </div>
              </ConditionalRenderer>

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
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    No JAMB subject scores recorded for this candidate.
                  </Typography.Text>
                </ConditionalRenderer>
              </div>

              <OlevelSittingsSubjectGrade
                sittings={
                  candidate?.application?.candidate?.olevelSittings ?? []
                }
                token={token}
              />

              <MetadataRenderer
                title="Metadata"
                value={candidate.metadata}
                variant="descriptions"
                size="small"
                bordered
                column={1}
              />
            </Flex>
          ) : null}
        </ConditionalRenderer>
      </DataLoader>
    </Drawer>
  );
}
