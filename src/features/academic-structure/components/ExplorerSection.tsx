// Feature: faculty-department-management
import { ExplainerCallout } from "@/components/ui-kit";
import { useInstitutionTerminology } from "@/shared/hooks/useInstitutionTerminology";

/**
 * ExplorerSection — dynamic explainer component.
 * Describes what academic units and departments are and how to use the feature.
 */
export function ExplorerSection() {
  const { academicUnit } = useInstitutionTerminology();

  return (
    <ExplainerCallout
      intent="new"
      collapsible
      dismissible
      title={academicUnit.combinedMenuLabel}
      body={`${academicUnit.plural} are the top-level academic divisions of the institution (${academicUnit.namePlaceholder}). Each ${academicUnit.singular} contains one or more Departments, which in turn host academic Programs. Use this page to create, edit, and delete ${academicUnit.plural} and Departments. Expand a ${academicUnit.singular} row to manage its Departments inline.`}
      aria-label={`${academicUnit.combinedMenuLabel} feature description`}
    />
  );
}
