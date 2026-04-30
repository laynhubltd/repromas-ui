// Feature: course-assessment-policy
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DeleteOutlined,
  DownOutlined,
  EditOutlined,
  PlusOutlined,
  RightOutlined,
} from "@ant-design/icons";
import { Button, Flex, Tag, Tooltip, Typography } from "antd";
import { useGetCourseAssessmentComponentsQuery } from "../api/courseAssessmentComponentsApi";
import type {
  CalculationMethod,
  CourseAssessmentComponent,
  CourseAssessmentPolicy,
} from "../types/course-assessment-policy";
import { WeightBar } from "./WeightBar";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CALCULATION_METHOD_LABELS: Record<CalculationMethod, string> = {
  WEIGHTED_SUM: "Weighted Sum",
  AVERAGE: "Average",
  BEST_OF: "Best Of",
};

// ─── Props ────────────────────────────────────────────────────────────────────

type PolicyCardProps = {
  policy: CourseAssessmentPolicy;
  isExpanded: boolean;
  onExpandToggle: () => void;
  onEdit: () => void;
  onDelete: (componentCount: number) => void;
  onAddComponent: (totalWeight: number, usedWeight: number) => void;
  onEditComponent: (
    component: CourseAssessmentComponent,
    totalWeight: number,
    usedWeight: number,
  ) => void;
  onDeleteComponent: (
    component: CourseAssessmentComponent,
    isLast: boolean,
  ) => void;
};

/**
 * PolicyCard — renders a single assessment policy card with an expandable
 * component accordion. Components are fetched lazily when the card is expanded.
 *
 * Requirements: 2.3, 2.4, 3.1–3.7, 4.1–4.6, 6.6, 7.11, 8.6, 12.4, 12.10
 */
export function PolicyCard({
  policy,
  isExpanded,
  onExpandToggle,
  onEdit,
  onDelete,
  onAddComponent,
  onEditComponent,
  onDeleteComponent,
}: PolicyCardProps) {
  const token = useToken();

  // Lazy fetch: only fires when the card is expanded
  const {
    data: componentsData,
    isLoading: isComponentsLoading,
    isError: isComponentsError,
    refetch: refetchComponents,
  } = useGetCourseAssessmentComponentsQuery(
    { "exact[policyId]": policy.id, sort: "code:asc" },
    { skip: !isExpanded },
  );

  const components = componentsData?.member ?? [];
  const isGlobal = policy.scope === "GLOBAL";

  return (
    <div
      style={{
        border: `1px solid ${token.colorBorder}`,
        borderRadius: token.borderRadiusLG,
        background: token.colorBgContainer,
        marginBottom: token.marginSM,
        overflow: "hidden",
      }}
    >
      {/* ── Card Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          borderBottom: isExpanded
            ? `1px solid ${token.colorBorderSecondary}`
            : undefined,
        }}
      >
        <Flex justify="space-between" align="flex-start" gap={12}>
          {/* Left: scope badge + name + meta */}
          <Flex vertical gap={6} style={{ flex: 1, minWidth: 0 }}>
            <Flex align="center" gap={8} wrap="wrap">
              {/* Scope badge */}
              <Tag color={isGlobal ? "purple" : "blue"} style={{ margin: 0 }}>
                {isGlobal ? "Global Fallback" : "Course"}
              </Tag>

              {/* Breakdown name */}
              <Typography.Text strong style={{ fontSize: token.fontSize }}>
                {policy.breakdownName}
              </Typography.Text>
            </Flex>
            {/* Course code + title (COURSE scope only) */}
            {!isGlobal && policy.courseConfig?.course && (
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                <strong>{policy.courseConfig.course.code}</strong>
                {" | "}
                {policy.courseConfig.course.title}
              </Typography.Text>
            )}
            {/* Meta row: calculation method + total weight */}
            <Flex align="center" gap={16} wrap="wrap">
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                {CALCULATION_METHOD_LABELS[policy.calculationMethod]}
              </Typography.Text>
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                Total weight: <strong>{policy.totalWeightPercentage}%</strong>
              </Typography.Text>
            </Flex>{" "}
          </Flex>

          {/* Right: action buttons + expand toggle */}
          <Flex align="center" gap={4} style={{ flexShrink: 0 }}>
            <PermissionGuard
              permission={Permission.CourseAssessmentPoliciesUpdate}
            >
              <Tooltip title="Edit policy">
                <Button
                  type="text"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={onEdit}
                />
              </Tooltip>
            </PermissionGuard>
            <PermissionGuard
              permission={Permission.CourseAssessmentPoliciesDelete}
            >
              <Tooltip title="Delete policy">
                <Button
                  type="text"
                  size="small"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onDelete(components.length)}
                />
              </Tooltip>
            </PermissionGuard>
            <Tooltip
              title={isExpanded ? "Collapse components" : "Expand components"}
            >
              <Button
                type="text"
                size="small"
                icon={isExpanded ? <DownOutlined /> : <RightOutlined />}
                onClick={onExpandToggle}
              />
            </Tooltip>
          </Flex>
        </Flex>
      </div>

      {/* ── Accordion: Component List ────────────────────────────────────── */}
      {isExpanded && (
        <div style={{ padding: `${token.paddingSM}px ${token.paddingMD}px` }}>
          {/* Loading skeleton */}
          {isComponentsLoading && <SkeletonRows count={3} variant="inline" />}

          {/* Error state */}
          {!isComponentsLoading && isComponentsError && (
            <ErrorAlert
              variant="section"
              error="Failed to load components"
              onRetry={refetchComponents}
            />
          )}

          {/* Component rows */}
          {!isComponentsLoading &&
            !isComponentsError &&
            components.length > 0 && (
              <>
                {/* Weight bar */}
                <div style={{ marginBottom: token.marginSM }}>
                  <WeightBar
                    components={components}
                    totalWeightPercentage={policy.totalWeightPercentage}
                  />
                </div>

                {/* Component list */}
                <div>
                  {components.map((component, index) => {
                    const isLast = index === components.length - 1;
                    return (
                      <div
                        key={component.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: `${token.paddingXS}px 0`,
                          borderBottom: !isLast
                            ? `1px solid ${token.colorBorderSecondary}`
                            : undefined,
                          gap: 8,
                        }}
                      >
                        {/* Component info */}
                        <Flex
                          align="center"
                          gap={8}
                          style={{ flex: 1, minWidth: 0 }}
                        >
                          <Typography.Text
                            strong
                            style={{
                              fontSize: token.fontSizeSM,
                              flexShrink: 0,
                            }}
                          >
                            {component.code}
                          </Typography.Text>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: token.fontSizeSM }}
                            ellipsis
                          >
                            {component.name}
                          </Typography.Text>
                          <Typography.Text
                            style={{
                              fontSize: token.fontSizeSM,
                              flexShrink: 0,
                            }}
                          >
                            {component.weightPercentage}%
                          </Typography.Text>

                          {/* Hurdle badges */}
                          {component.isMandatoryToAttempt && (
                            <Tag
                              color="orange"
                              style={{
                                margin: 0,
                                fontSize: token.fontSizeSM - 1,
                              }}
                            >
                              Mandatory
                            </Tag>
                          )}
                          {component.mustPass && (
                            <Tag
                              color="red"
                              style={{
                                margin: 0,
                                fontSize: token.fontSizeSM - 1,
                              }}
                            >
                              Must Pass
                              {component.minPassPercentage != null &&
                                ` ≥ ${component.minPassPercentage}%`}
                            </Tag>
                          )}
                        </Flex>

                        {/* Component action buttons */}
                        <Flex align="center" gap={2} style={{ flexShrink: 0 }}>
                          <PermissionGuard
                            permission={
                              Permission.CourseAssessmentComponentsUpdate
                            }
                          >
                            <Tooltip title="Edit component">
                              <Button
                                type="text"
                                size="small"
                                icon={<EditOutlined style={{ fontSize: 13 }} />}
                                onClick={() => {
                                  const usedWeight = components
                                    .filter((c) => c.id !== component.id)
                                    .reduce(
                                      (sum, c) => sum + c.weightPercentage,
                                      0,
                                    );
                                  onEditComponent(
                                    component,
                                    policy.totalWeightPercentage,
                                    usedWeight,
                                  );
                                }}
                              />
                            </Tooltip>
                          </PermissionGuard>
                          <PermissionGuard
                            permission={
                              Permission.CourseAssessmentComponentsDelete
                            }
                          >
                            <Tooltip title="Delete component">
                              <Button
                                type="text"
                                size="small"
                                danger
                                icon={
                                  <DeleteOutlined style={{ fontSize: 13 }} />
                                }
                                onClick={() =>
                                  onDeleteComponent(
                                    component,
                                    components.length === 1,
                                  )
                                }
                              />
                            </Tooltip>
                          </PermissionGuard>
                        </Flex>
                      </div>
                    );
                  })}
                </div>

                {/* Add component CTA (below list) */}
                <div style={{ marginTop: token.marginSM }}>
                  <PermissionGuard
                    permission={Permission.CourseAssessmentComponentsCreate}
                  >
                    <Button
                      type="dashed"
                      size="small"
                      icon={<PlusOutlined />}
                      onClick={() => {
                        const usedWeight = components.reduce(
                          (sum, c) => sum + c.weightPercentage,
                          0,
                        );
                        onAddComponent(
                          policy.totalWeightPercentage,
                          usedWeight,
                        );
                      }}
                    >
                      {" "}
                      Add Component
                    </Button>
                  </PermissionGuard>
                </div>
              </>
            )}

          {/* Empty state */}
          {!isComponentsLoading &&
            !isComponentsError &&
            components.length === 0 && (
              <Flex
                vertical
                align="center"
                justify="center"
                style={{
                  padding: `${token.paddingMD}px`,
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgLayout,
                }}
              >
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", marginBottom: token.marginXS }}
                >
                  No components yet
                </Typography.Text>
                <PermissionGuard
                  permission={Permission.CourseAssessmentComponentsCreate}
                >
                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() =>
                      onAddComponent(policy.totalWeightPercentage, 0)
                    }
                  >
                    Add Component
                  </Button>
                </PermissionGuard>
              </Flex>
            )}
        </div>
      )}
    </div>
  );
}
