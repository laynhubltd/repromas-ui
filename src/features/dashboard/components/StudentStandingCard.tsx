import { Card, Flex, Skeleton, Tag, Typography } from "antd";
import { useToken } from "@/shared/hooks/useToken";
import { formatCount } from "@/shared/utils/format/formatCount";
import { safePercent } from "../utils/dashboardMath";
import type { StudentStandingCardProps } from "../types/dashboard";

export const StudentStandingCard: React.FC<StudentStandingCardProps> = ({
  lifecycle,
  isLoading,
}) => {
  const token = useToken();

  if (isLoading) {
    return (
      <Card
        title="Student Standing & Academic Risk"
        style={{ height: "100%", borderRadius: token.borderRadiusLG }}
      >
        <Skeleton active paragraph={{ rows: 5 }} />
      </Card>
    );
  }

  const enrolledHeadcount = lifecycle?.enrolledHeadcount ?? 0;
  const goodStandingCount = lifecycle?.goodStandingCount ?? 0;
  const academicRiskCount = lifecycle?.academicRiskCount ?? 0;
  const neutralStandingCount = lifecycle?.neutralStandingCount ?? 0;
  const noTransitionCount = lifecycle?.noTransitionCount ?? 0;

  const goodPercent = safePercent(goodStandingCount, enrolledHeadcount);
  const riskPercent = safePercent(academicRiskCount, enrolledHeadcount);
  const neutralPercent = safePercent(neutralStandingCount, enrolledHeadcount);
  const gapPercent = safePercent(noTransitionCount, enrolledHeadcount);

  const semanticKind = lifecycle?.semanticKindDistribution ?? {};

  return (
    <Card
      title="Student Standing & Academic Risk"
      extra={
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {formatCount(enrolledHeadcount)} Active Students
        </Typography.Text>
      }
      style={{ height: "100%", borderRadius: token.borderRadiusLG }}
    >
      <Flex vertical gap={16}>
        {/* Multi-Segment Stacked Progress Bar */}
        <Flex vertical gap={6}>
          <div
            style={{
              height: 14,
              borderRadius: token.borderRadiusSM,
              display: "flex",
              overflow: "hidden",
              background: token.colorBgLayout,
              width: "100%",
            }}
          >
            {goodPercent > 0 && (
              <div
                style={{
                  width: `${goodPercent}%`,
                  background: token.colorSuccess,
                  transition: "width 0.4s ease",
                }}
                title={`Good Standing: ${goodPercent}%`}
              />
            )}
            {riskPercent > 0 && (
              <div
                style={{
                  width: `${riskPercent}%`,
                  background: token.colorError,
                  transition: "width 0.4s ease",
                }}
                title={`Academic Risk: ${riskPercent}%`}
              />
            )}
            {neutralPercent > 0 && (
              <div
                style={{
                  width: `${neutralPercent}%`,
                  background: token.colorWarning,
                  transition: "width 0.4s ease",
                }}
                title={`Neutral / Leave: ${neutralPercent}%`}
              />
            )}
            {gapPercent > 0 && (
              <div
                style={{
                  width: `${gapPercent}%`,
                  background: token.colorTextTertiary,
                  transition: "width 0.4s ease",
                }}
                title={`Pending Transition: ${gapPercent}%`}
              />
            )}
          </div>

          {/* Color + Label Legend Pairing (Color-Blind Accessible) */}
          <Flex wrap gap={12} justify="space-between" style={{ fontSize: token.fontSizeSM }}>
            <Flex align="center" gap={6}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: token.colorSuccess,
                }}
              />
              <Typography.Text>
                Positive: <strong>{formatCount(goodStandingCount)}</strong> ({goodPercent}%)
              </Typography.Text>
            </Flex>

            <Flex align="center" gap={6}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: token.colorError,
                }}
              />
              <Typography.Text>
                Academic Risk: <strong>{formatCount(academicRiskCount)}</strong> ({riskPercent}%)
              </Typography.Text>
            </Flex>

            <Flex align="center" gap={6}>
              <span
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: token.colorWarning,
                }}
              />
              <Typography.Text>
                Neutral / Deferred: <strong>{formatCount(neutralStandingCount)}</strong> ({neutralPercent}%)
              </Typography.Text>
            </Flex>
          </Flex>
        </Flex>

        {/* Semantic Kind Breakdown */}
        <div
          style={{
            borderTop: `1px solid ${token.colorBorderSecondary}`,
            paddingTop: 12,
          }}
        >
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 8 }}
          >
            Progression Standing Breakdown
          </Typography.Text>
          <Flex wrap gap={8}>
            {Object.entries(semanticKind).map(([kind, count]) => {
              let color = "default";
              if (kind === "GOOD_STANDING") color = "success";
              else if (kind === "PROBATION" || kind === "REPEAT") color = "error";
              else if (kind === "DEFERRED" || kind === "SPILLOVER") color = "warning";
              else if (kind === "GRADUATED") color = "blue";
              else if (kind === "WITHDRAWN") color = "magenta";

              return (
                <Tag key={kind} color={color} style={{ margin: 0 }}>
                  {kind.replace("_", " ")}: <strong>{formatCount(count)}</strong>
                </Tag>
              );
            })}
          </Flex>
        </div>
      </Flex>
    </Card>
  );
};
