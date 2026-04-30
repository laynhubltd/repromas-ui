// Feature: course-assessment-policy
import { ExplainerCallout } from "@/components";
import { useCourseAssessmentPolicyTab } from "../hooks/useCourseAssessmentPolicyTab";
import { ComponentFormModal } from "./modals/ComponentFormModal";
import { DeleteComponentModal } from "./modals/DeleteComponentModal";
import { DeletePolicyModal } from "./modals/DeletePolicyModal";
import { PolicyFormModal } from "./modals/PolicyFormModal";
import { PolicyList } from "./PolicyList";

/**
 * CourseAssessmentPolicyTab — root tab component for the Assessment Policy segment.
 * Invokes useCourseAssessmentPolicyTab at the top level and delegates all rendering
 * to view-only child components. Contains no business logic.
 *
 * Requirements: 12.4, 12.5, 12.6
 */
export function CourseAssessmentPolicyTab() {
  const { state, actions, flags } = useCourseAssessmentPolicyTab();

  return (
    <>
      <ExplainerCallout
        intent="info"
        title="Assessment Policies"
        body="Define grading rulesets for courses. Each policy specifies how a course's final grade is calculated, the calculation method, total weight, and veto rules. Course-scoped policies apply to a specific course configuration; the Global policy acts as a system-wide fallback when no course-specific policy exists."
        dismissible
        collapsible
      />
      <PolicyList
        policies={state.policies}
        isLoading={state.isLoading}
        isError={state.isError}
        scopeFilter={state.scopeFilter}
        expandedPolicyIds={state.expandedPolicyIds}
        totalItems={state.totalItems}
        page={state.page}
        itemsPerPage={state.itemsPerPage}
        courseCodeSearch={state.courseCodeSearch}
        onScopeFilterChange={actions.handleScopeFilterChange}
        onCourseCodeSearchChange={actions.handleCourseCodeSearchChange}
        onPageChange={actions.handlePageChange}
        onExpandToggle={actions.handleExpandToggle}
        onOpenCreate={actions.handleOpenCreatePolicy}
        onOpenEdit={actions.handleOpenEditPolicy}
        onOpenDelete={actions.handleOpenDeletePolicy}
        onOpenAddComponent={actions.handleOpenAddComponent}
        onOpenEditComponent={actions.handleOpenEditComponent}
        onOpenDeleteComponent={actions.handleOpenDeleteComponent}
        onRetry={actions.refetch}
        hasGlobalPolicy={flags.hasGlobalPolicy}
      />

      <PolicyFormModal
        open={state.policyFormOpen}
        target={state.policyFormTarget}
        onClose={actions.handleClosePolicy}
      />

      <DeletePolicyModal
        open={state.deletePolicyOpen}
        target={state.deletePolicyTarget}
        componentCount={state.deletePolicyComponentCount}
        onClose={actions.handleCloseDeletePolicy}
      />

      <ComponentFormModal
        open={state.componentFormOpen}
        policyId={state.componentFormPolicyId}
        policyName={
          state.policies.find((p) => p.id === state.componentFormPolicyId)
            ?.breakdownName ?? null
        }
        target={state.componentFormTarget}
        totalWeightPercentage={state.componentFormTotalWeight}
        usedWeight={state.componentFormUsedWeight}
        onClose={actions.handleCloseComponent}
      />

      <DeleteComponentModal
        open={state.deleteComponentOpen}
        target={state.deleteComponentTarget}
        isLastComponent={state.deleteComponentIsLast}
        onClose={actions.handleCloseDeleteComponent}
      />
    </>
  );
}
