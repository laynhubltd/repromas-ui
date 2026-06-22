import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { RECOMMENDED_DECISION_LABELS } from "@/shared/constants/admissionRecommendedCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { GiftOutlined } from "@ant-design/icons";
import { Button, Descriptions, Drawer, Flex, Tag, Typography } from "antd";
import { useRecommendedCandidateDrawer } from "../hooks/useRecommendedCandidateDrawer";
import type { AdmissionRecommendedCandidate } from "../types/admission-recommended-candidate";
import { recommendedDecisionTagColor } from "../utiles/recommendationDisplay";
import { MetadataRenderer } from "@/shared/ui/MetadataRenderer";
import OlevelSittingsSubjectGrade from "@/features/admission-candidate/components/OlevelSittingsSubjectGrade";
import { resolveRelatedName } from "../../candidate/utils/resolveRelatedLabel";

type RecommendedCandidateDetailDrawerProps = {
  open: boolean;
  target: AdmissionRecommendedCandidate | null;
  onClose: () => void;
  onOffer?: (target: AdmissionRecommendedCandidate) => void;
};

const QUOTA_TAG_COLOR: Record<string, string> = {
  MERIT: "blue",
  CATCHMENT: "geekblue",
  ELDS: "purple",
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function resolveProgramLabel(
  program: { name: string } | undefined,
  programId: number | null | undefined,
): string {
  if (program?.name) return program.name;
  if (programId != null) return `Program #${programId}`;
  return "—";
}

// ─── Main component ──────────────────────────────────────────────────────────

export function RecommendedCandidateDetailDrawer({
  open,
  target,
  onClose,
  onOffer,
}: RecommendedCandidateDetailDrawerProps) {
  const token = useToken();
  const { state, actions } = useRecommendedCandidateDrawer(
    target?.candidateId ?? null,
    open,
  );
  const { candidate, isLoading, isError } = state;

  const isChangeOfCourse =
    target?.recommendedDecision === "OFFER_CHANGE_OF_COURSE";
  const isRejected = target?.recommendedDecision === "REJECTED";

  console.log({ target });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width={720}
      placement="right"
      title={
        target ? (
          <Flex align="center" gap={8}>
            <Typography.Text strong style={{ fontSize: token.fontSize }}>
              {target.firstName} {target.lastName}
            </Typography.Text>
            <Tag color={QUOTA_TAG_COLOR[target.quotaCategory]}>
              {target.quotaCategory}
            </Tag>
          </Flex>
        ) : (
          "Recommendation Details"
        )
      }
      footer={
        <Flex gap={8} justify="flex-end" wrap="wrap">
          <PermissionGuard permission={Permission.AdmissionCandidatesManage}>
            <Button
              type="primary"
              icon={<GiftOutlined />}
              disabled={!target || isRejected}
              onClick={() => target && onOffer?.(target)}
            >
              Offer
            </Button>
          </PermissionGuard>
        </Flex>
      }
      destroyOnHidden
    >
      <ConditionalRenderer when={target != null}>
        <Flex vertical gap={24}>
          <Descriptions title="Candidate Info" bordered size="small" column={1}>
            <Descriptions.Item label="JAMB Reg. No.">
              {target?.application?.candidate?.jambRegNo}
            </Descriptions.Item>
            <Descriptions.Item label="Admission Cycle">
              {resolveRelatedName(target?.application?.candidate?.cycle, target?.application?.candidate?.cycleId)}
            </Descriptions.Item>
            <Descriptions.Item label="Gender">
              {target?.application?.candidate?.gender ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Date of Birth">
              {formatDate(target?.application?.candidate?.dateOfBirth)}
            </Descriptions.Item>
            <Descriptions.Item label="State">
              {resolveRelatedName(target?.application?.candidate?.state, target?.application?.candidate?.stateId)}
            </Descriptions.Item>
            <Descriptions.Item label="LGA">
              {target?.application?.candidate?.lgaId != null
                ? resolveRelatedName(target.application?.candidate?.lga, target?.application?.candidate?.lgaId)
                : "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Entry Mode">
              {target?.application?.candidate?.entryMode}
            </Descriptions.Item>
            <Descriptions.Item label="Email">
              {target?.application?.candidate?.email ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Phone">
              {target?.application?.candidate?.phone ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Created">
              {formatDate(target?.application?.candidate?.createdAt)}
            </Descriptions.Item>
          </Descriptions>

          <Descriptions title="Recommendation" bordered size="small" column={1}>
            <Descriptions.Item label="Aggregate Score">
              {target?.aggregateScore ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Quota Category">
              {target?.quotaCategory ?? "—"}
            </Descriptions.Item>
            <Descriptions.Item label="Recommended Decision">
              {target != null && (
                <Tag
                  color={recommendedDecisionTagColor(
                    target.recommendedDecision,
                  )}
                >
                  {RECOMMENDED_DECISION_LABELS[target.recommendedDecision] ??
                    target.recommendedDecision}
                </Tag>
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Applied Program">
              {resolveProgramLabel(
                target?.appliedProgram,
                target?.appliedProgramId,
              )}
            </Descriptions.Item>
            {isChangeOfCourse && (
              <Descriptions.Item label="Proposed Program">
                {resolveProgramLabel(
                  target?.recommendedOfferedProgram,
                  target?.recommendedOfferedProgramId,
                )}
              </Descriptions.Item>
            )}
            <Descriptions.Item label="Reason Code">
              <Typography.Text code>
                {target?.reasonCode ?? "—"}
              </Typography.Text>
            </Descriptions.Item>
          </Descriptions>

          <DataLoader
            loading={isLoading}
            loader={<SkeletonRows count={4} variant="card" />}
          >
            <ConditionalRenderer when={isError}>
              <ErrorAlert
                variant="section"
                error="Failed to load candidate dossier"
                onRetry={actions.refetch}
              />
            </ConditionalRenderer>

            <ConditionalRenderer when={!isError && candidate != null}>
              <Flex vertical gap={24}>
                <ConditionalRenderer when={candidate?.screening != null}>
                  <Descriptions
                    title="Screening"
                    bordered
                    size="small"
                    column={1}
                  >
                    <Descriptions.Item label="JAMB Total">
                      {candidate?.screening?.jambScore ?? "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="School Raw Score">
                      {candidate?.screening?.schoolRawScore ?? "—"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Aggregate Score">
                      {candidate?.screening?.aggregateScore ?? "—"}
                    </Descriptions.Item>
                  </Descriptions>
                </ConditionalRenderer>

                <OlevelSittingsSubjectGrade
                  sittings={
                    candidate?.application?.candidate?.olevelSittings ?? []
                  }
                  token={token}
                />

                <ConditionalRenderer
                  when={
                    candidate?.metadata != null &&
                    Object.keys(candidate.metadata).length > 0
                  }
                >
                  <MetadataRenderer
                    title="Additional Information"
                    value={candidate?.metadata}
                    variant="descriptions"
                    size="small"
                    bordered
                    showRawToggle
                    showCopyJson
                    column={1}
                  />
                </ConditionalRenderer>
              </Flex>
            </ConditionalRenderer>
          </DataLoader>
        </Flex>
      </ConditionalRenderer>
    </Drawer>
  );
}
