import { notification } from "antd";

export type MutationVerb =
  | "created"
  | "updated"
  | "deleted"
  | "saved"
  | "activated"
  | "synced"
  | "removed"
  | "assigned"
  | "revoked";

/**
 * Shows a transient success popup after a mutation completes.
 * Call after `.unwrap()` succeeds, before closing modals or resetting forms.
 */
export function notifyMutationSuccess(
  message: string,
  description?: string,
): void {
  notification.success({
    message,
    description: description || undefined,
    duration: 4,
  });
}

/** Builds standard CRUD copy: "Faculty created successfully." */
export function mutationSuccessMessage(
  entityLabel: string,
  verb: MutationVerb,
): string {
  return `${entityLabel} ${verb} successfully.`;
}
