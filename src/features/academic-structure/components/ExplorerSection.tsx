// Feature: faculty-department-management
import { ExplainerCallout } from "@/components/ui-kit";

/**
 * ExplorerSection — static presentational component.
 * Describes what Faculties and Departments are and how to use the feature.
 * No props, no hook.
 */
export function ExplorerSection() {
  return (
    <ExplainerCallout
      intent="new"
      collapsible
      dismissible
      title="Faculties & Departments"
      body="Faculties are the top-level academic divisions of the institution (e.g. Faculty of Science). Each Faculty contains one or more Departments (e.g. Department of Computer Science), which in turn host academic Programs. Use this page to create, edit, and delete Faculties and Departments. Expand a Faculty row to manage its Departments inline."
      aria-label="Faculties and Departments feature description"
    />
  );
}
