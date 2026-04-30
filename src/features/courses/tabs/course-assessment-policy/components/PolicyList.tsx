// Feature: course-assessment-policy
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined } from "@ant-design/icons";
import {
  Button,
  Col,
  Flex,
  Input,
  Pagination,
  Row,
  Select,
  Typography,
} from "antd";
import type {
  CourseAssessmentComponent,
  CourseAssessmentPolicy,
  ScopeFilter,
} from "../types/course-assessment-policy";
import { PolicyCard } from "./PolicyCard";

// ─── Props ────────────────────────────────────────────────────────────────────

type PolicyListProps = {
  policies: CourseAssessmentPolicy[];
  isLoading: boolean;
  isError: boolean;
  scopeFilter: ScopeFilter;
  expandedPolicyIds: Set<number>;
  totalItems: number;
  page: number;
  itemsPerPage: number;
  courseCodeSearch: string;
  onScopeFilterChange: (value: ScopeFilter) => void;
  onCourseCodeSearchChange: (value: string) => void;
  onPageChange: (page: number, itemsPerPage: number) => void;
  onExpandToggle: (policyId: number) => void;
  onOpenCreate: () => void;
  onOpenEdit: (policy: CourseAssessmentPolicy) => void;
  onOpenDelete: (
    policy: CourseAssessmentPolicy,
    componentCount: number,
  ) => void;
  onOpenAddComponent: (
    policyId: number,
    totalWeight: number,
    usedWeight: number,
  ) => void;
  onOpenEditComponent: (
    component: CourseAssessmentComponent,
    totalWeight: number,
    usedWeight: number,
  ) => void;
  onOpenDeleteComponent: (
    component: CourseAssessmentComponent,
    isLast: boolean,
  ) => void;
  onRetry: () => void;
  hasGlobalPolicy: boolean;
};

// ─── Scope filter options ─────────────────────────────────────────────────────

const SCOPE_OPTIONS: { value: ScopeFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "COURSE", label: "Course" },
  { value: "GLOBAL", label: "Global" },
];

/**
 * PolicyList — renders the filter toolbar and the list of PolicyCard components.
 * Handles loading skeleton, error alert, and empty state.
 *
 * GLOBAL-scoped policies are always sorted to the top of the list.
 *
 * Requirements: 2.2, 2.4, 2.5, 2.6, 2.7, 2.8, 5.16, 5.17, 13.4
 */
export function PolicyList({
  policies,
  isLoading,
  isError,
  scopeFilter,
  expandedPolicyIds,
  totalItems,
  page,
  itemsPerPage,
  courseCodeSearch,
  onScopeFilterChange,
  onCourseCodeSearchChange,
  onPageChange,
  onExpandToggle,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onOpenAddComponent,
  onOpenEditComponent,
  onOpenDeleteComponent,
  onRetry,
  hasGlobalPolicy,
}: PolicyListProps) {
  const token = useToken();

  // GLOBAL-scoped policies always appear at the top
  const sortedPolicies = [...policies].sort((a, b) => {
    if (a.scope === "GLOBAL" && b.scope !== "GLOBAL") return -1;
    if (a.scope !== "GLOBAL" && b.scope === "GLOBAL") return 1;
    return 0;
  });

  const hasData = policies.length > 0;

  // "Create Policy" is disabled when trying to create another GLOBAL policy
  const isCreateDisabled = hasGlobalPolicy && scopeFilter === "GLOBAL";

  return (
    <Flex vertical gap={16}>
      {/* ── Filter Toolbar ─────────────────────────────────────────────── */}
      <Flex justify="space-between" align="center" gap={12} wrap="wrap">
        <Flex align="center" gap={8} wrap="wrap" flex={1}>
          <Input.Search
            placeholder="Search by policy name…"
            allowClear
            value={courseCodeSearch}
            onChange={(e) => onCourseCodeSearchChange(e.target.value)}
            onSearch={onCourseCodeSearchChange}
            style={{ width: 220 }}
          />
          <Flex align="center" gap={8}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              Scope:
            </Typography.Text>
            <Select<ScopeFilter>
              value={scopeFilter}
              onChange={onScopeFilterChange}
              options={SCOPE_OPTIONS}
              style={{ width: 120 }}
              size="small"
            />
          </Flex>
        </Flex>

        <PermissionGuard permission={Permission.CourseAssessmentPoliciesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onOpenCreate}
            disabled={isCreateDisabled}
            title={
              isCreateDisabled
                ? "A global fallback policy already exists"
                : undefined
            }
          >
            Create Policy
          </Button>
        </PermissionGuard>
      </Flex>

      {/* ── Content ────────────────────────────────────────────────────── */}
      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={3} variant="card" />}
        minHeight="200px"
      >
        {/* Error state */}
        <ConditionalRenderer when={isError}>
          <ErrorAlert
            variant="section"
            error="Failed to load assessment policies"
            onRetry={onRetry}
          />
        </ConditionalRenderer>

        {/* Empty state */}
        <ConditionalRenderer
          when={!isError && !hasData}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Text
            type="secondary"
            style={{ display: "block", marginBottom: token.marginSM }}
          >
            No assessment policies configured. Create your first policy to get
            started.
          </Typography.Text>
          <PermissionGuard
            permission={Permission.CourseAssessmentPoliciesCreate}
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={onOpenCreate}
            >
              Create Policy
            </Button>
          </PermissionGuard>
        </ConditionalRenderer>

        {/* Policy cards */}
        <ConditionalRenderer when={!isError && hasData}>
          <Flex vertical gap={16}>
            <Row gutter={[16, 16]}>
              {sortedPolicies.map((policy) => (
                <Col key={policy.id} xs={24} md={12}>
                  <PolicyCard
                    policy={policy}
                    isExpanded={expandedPolicyIds.has(policy.id)}
                    onExpandToggle={() => onExpandToggle(policy.id)}
                    onEdit={() => onOpenEdit(policy)}
                    onDelete={(componentCount) =>
                      onOpenDelete(policy, componentCount)
                    }
                    onAddComponent={(totalWeight, usedWeight) =>
                      onOpenAddComponent(policy.id, totalWeight, usedWeight)
                    }
                    onEditComponent={(component, totalWeight, usedWeight) =>
                      onOpenEditComponent(component, totalWeight, usedWeight)
                    }
                    onDeleteComponent={onOpenDeleteComponent}
                  />
                </Col>
              ))}
            </Row>
            <Flex justify="flex-end">
              <Pagination
                current={page}
                pageSize={itemsPerPage}
                total={totalItems}
                showSizeChanger
                showTotal={(total) => `${total} policies`}
                onChange={onPageChange}
                onShowSizeChange={onPageChange}
              />
            </Flex>
          </Flex>
        </ConditionalRenderer>
      </DataLoader>
    </Flex>
  );
}
