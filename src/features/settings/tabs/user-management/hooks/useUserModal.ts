import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { Form } from "antd";
import { useCallback, useReducer } from "react";
import {
  useAssignRoleToUserMutation,
  useGetRolesQuery,
  useGetUserRolesQuery,
  useRevokeRoleFromUserMutation,
} from "@/features/settings/tabs/rbac-settings/api/rbacSettingsApi";
import type { Role } from "@/features/settings/tabs/rbac-settings/types/rbac";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../api/userManagementApi";
import {
  UserRoleAssignmentActionType,
  initialUserRoleAssignmentState,
  userRoleAssignmentReducer,
} from "../state/userRoleAssignmentState";
import type { TenantUser, UserRoleDetail } from "../types/user-management";
import { generateTempPassword } from "../utils/generateTempPassword";

// ── Create / Edit form values ─────────────────────────────────────────────────

export type UserFormValues = {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  roleId: number;
  scopeReferenceId?: number | null;
  // Edit-only
  dateOfBirth?: string | null;
};

// ─── Upsert (Create / Edit) ───────────────────────────────────────────────────

const SCOPE_QUERY_SMALL = { itemsPerPage: 200 } as const;

export function useUserFormModal(
  target: TenantUser | null,
  open: boolean,
  onClose: () => void,
  roles: Role[],
) {
  const isEditMode = target !== null;
  const handleApiError = useApiError();

  const [form] = Form.useForm<UserFormValues>();

  const [createUser, { isLoading: isCreating }] = useCreateUserMutation();
  const [updateUser, { isLoading: isUpdating }] = useUpdateUserMutation();

  const isSubmitting = isCreating || isUpdating;

  // ── Scope reference — create mode only ───────────────────────────────────

  // Watch the roleId field reactively so we can derive scope without useEffect.
  // Form.useWatch returns undefined before the form mounts — default to null.
  const watchedRoleId: number | undefined = Form.useWatch("roleId", form);

  const selectedRole = roles.find((r) => r.id === watchedRoleId) ?? null;
  const needsScopeRef =
    !isEditMode &&
    selectedRole !== null &&
    selectedRole.scope !== "GLOBAL" &&
    selectedRole.scope !== "CANDIDATE";

  const { data: facultiesData, isLoading: isLoadingFaculties } =
    useGetFacultiesQuery(SCOPE_QUERY_SMALL, {
      skip: !open || !needsScopeRef || selectedRole?.scope !== "FACULTY",
    });

  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useGetDepartmentsQuery(SCOPE_QUERY_SMALL, {
      skip: !open || !needsScopeRef || selectedRole?.scope !== "DEPARTMENT",
    });

  const { data: programsData, isLoading: isLoadingPrograms } =
    useGetProgramsQuery(SCOPE_QUERY_SMALL, {
      skip: !open || !needsScopeRef || selectedRole?.scope !== "PROGRAM",
    });

  const scopeRefOptions = (() => {
    if (!needsScopeRef || !selectedRole) return [];
    switch (selectedRole.scope) {
      case "FACULTY":
        return (facultiesData?.member ?? []).map((f) => ({
          value: f.id,
          label: f.name,
        }));
      case "DEPARTMENT":
        return (departmentsData?.member ?? []).map((d) => ({
          value: d.id,
          label: d.name,
        }));
      case "PROGRAM":
        return (programsData?.member ?? []).map((p) => ({
          value: p.id,
          label: p.name,
        }));
      default:
        return [];
    }
  })();

  const isScopeRefLoading =
    isLoadingFaculties || isLoadingDepartments || isLoadingPrograms;

  // ── Initial values ────────────────────────────────────────────────────────

  // Stable initial values — form remounts via key in the view so no useEffect needed
  const initialValues: Partial<UserFormValues> = isEditMode
    ? {
        email: target.email,
        firstName: target.firstName ?? "",
        lastName: target.lastName ?? "",
        phoneNumber: target.phoneNumber ?? "",
        dateOfBirth: target.dateOfBirth ?? undefined,
      }
    : {
        email: "",
        firstName: "",
        lastName: "",
        phoneNumber: "",
      };

  // ── Submit ────────────────────────────────────────────────────────────────

  const handleSubmit = useCallback(async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode) {
        await updateUser({
          id: target.id,
          firstName: values.firstName.trim() || undefined,
          lastName: values.lastName.trim() || undefined,
          phoneNumber: values.phoneNumber.trim() || undefined,
          dateOfBirth: values.dateOfBirth ?? null,
        }).unwrap();

        notifyMutationSuccess(mutationSuccessMessage("User", "updated"));
      } else {
        // Validate scope reference when required
        if (needsScopeRef && !values.scopeReferenceId) {
          handleApiError(
            new Error(
              `A ${selectedRole?.scope.toLowerCase() ?? "scope"} reference is required for this role.`,
            ),
            { context: { screen: RequestScreen.Modal, method: "POST" } },
          );
          return;
        }

        await createUser({
          email: values.email.trim(),
          password: generateTempPassword(),
          firstName: values.firstName.trim(),
          lastName: values.lastName.trim(),
          phoneNumber: values.phoneNumber.trim(),
          roleId: values.roleId,
          scopeReferenceId: needsScopeRef
            ? (values.scopeReferenceId ?? null)
            : null,
          sendPasswordReset: true,
        }).unwrap();

        notifyMutationSuccess(
          "User created. A password reset email has been sent.",
        );
      }

      form.resetFields();
      onClose();
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Modal,
          method: isEditMode ? "PATCH" : "POST",
        },
        form,
      });
    }
  }, [
    form,
    isEditMode,
    target,
    needsScopeRef,
    selectedRole,
    createUser,
    updateUser,
    onClose,
    handleApiError,
  ]);

  const handleCancel = useCallback(() => {
    form.resetFields();
    onClose();
  }, [form, onClose]);

  void open;

  return {
    state: {
      isSubmitting,
      isEditMode,
      initialValues,
      needsScopeRef,
      selectedRoleScope: selectedRole?.scope ?? null,
      scopeRefOptions,
      isScopeRefLoading,
    },
    actions: { handleSubmit, handleCancel },
    form,
  };
}

// ─── Manage User Roles (assign + revoke, multi-role) ─────────────────────────

const ROLES_QUERY = { itemsPerPage: 200 } as const;
const SCOPE_QUERY = { itemsPerPage: 200 } as const;

export function useManageUserRolesModal(
  target: TenantUser | null,
  open: boolean,
  onClose: () => void,
) {
  const handleApiError = useApiError();

  const [formState, dispatch] = useReducer(
    userRoleAssignmentReducer,
    initialUserRoleAssignmentState,
  );

  // ── Current assignments ─────────────────────────────────────────────────────

  const {
    data: userRolesData,
    isLoading: isLoadingAssignments,
    refetch: refetchAssignments,
  } = useGetUserRolesQuery(
    { userId: target?.id ?? 0 },
    { skip: !open || !target },
  );

  const assignments: UserRoleDetail[] = (userRolesData?.member ?? []).map(
    (ur) => ({
      id: ur.id,
      userId: ur.userId,
      roleId: ur.roleId,
      roleName: ur.roleName,
      scope: ur.scope,
      scopeReferenceId: ur.scopeReferenceId,
      tenantId: ur.tenantId,
      assignedAt: ur.assignedAt,
    }),
  );

  // ── Role options datasource ─────────────────────────────────────────────────

  const { data: rolesData, isLoading: isLoadingRoles } =
    useGetRolesQuery(ROLES_QUERY, { skip: !open });

  const roleOptions = (rolesData?.member ?? []).map((r: Role) => ({
    value: r.id,
    label: r.name,
    scope: r.scope,
  }));

  // Derive selected role's scope to conditionally show scope reference select
  const selectedRole = (rolesData?.member ?? []).find(
    (r: Role) => r.id === formState.selectedRoleId,
  ) ?? null;
  const needsScopeRef =
    selectedRole !== null && selectedRole.scope !== "GLOBAL" && selectedRole.scope !== "CANDIDATE";

  // ── Scope reference datasources — fetched only when needed ─────────────────

  const { data: facultiesData, isLoading: isLoadingFaculties } =
    useGetFacultiesQuery(SCOPE_QUERY, {
      skip: !open || !needsScopeRef || selectedRole?.scope !== "FACULTY",
    });

  const { data: departmentsData, isLoading: isLoadingDepartments } =
    useGetDepartmentsQuery(SCOPE_QUERY, {
      skip: !open || !needsScopeRef || selectedRole?.scope !== "DEPARTMENT",
    });

  const { data: programsData, isLoading: isLoadingPrograms } =
    useGetProgramsQuery(SCOPE_QUERY, {
      skip: !open || !needsScopeRef || selectedRole?.scope !== "PROGRAM",
    });

  const scopeRefOptions = (() => {
    if (!needsScopeRef || !selectedRole) return [];
    switch (selectedRole.scope) {
      case "FACULTY":
        return (facultiesData?.member ?? []).map((f) => ({
          value: f.id,
          label: f.name,
        }));
      case "DEPARTMENT":
        return (departmentsData?.member ?? []).map((d) => ({
          value: d.id,
          label: d.name,
        }));
      case "PROGRAM":
        return (programsData?.member ?? []).map((p) => ({
          value: p.id,
          label: p.name,
        }));
      default:
        return [];
    }
  })();

  const isScopeRefLoading =
    isLoadingFaculties || isLoadingDepartments || isLoadingPrograms;

  // ── Mutations ───────────────────────────────────────────────────────────────

  const [assignRole, { isLoading: isAssigning }] = useAssignRoleToUserMutation();
  const [revokeRole, { isLoading: isRevoking }] = useRevokeRoleFromUserMutation();

  // ── Add role handler ────────────────────────────────────────────────────────

  const handleAddRole = useCallback(async () => {
    if (!target || !formState.selectedRoleId) return;

    const scopeReferenceId =
      needsScopeRef ? (formState.selectedScopeRefId ?? null) : null;

    if (needsScopeRef && scopeReferenceId === null) {
      handleApiError(
        new Error(
          `A ${selectedRole?.scope.toLowerCase() ?? "scope"} reference is required for this role.`,
        ),
        { context: { screen: RequestScreen.Action, method: "POST" } },
      );
      return;
    }

    try {
      await assignRole({
        userId: target.id,
        roleId: formState.selectedRoleId,
        scopeReferenceId,
      }).unwrap();

      notifyMutationSuccess("Role assigned successfully.");
      dispatch({ type: UserRoleAssignmentActionType.SetSelectedRoleId, roleId: null });
    } catch (err: unknown) {
      handleApiError(err, {
        context: { screen: RequestScreen.Action, method: "POST" },
      });
    }
  }, [
    target,
    formState.selectedRoleId,
    formState.selectedScopeRefId,
    needsScopeRef,
    selectedRole,
    assignRole,
    handleApiError,
  ]);

  // ── Revoke role handler ─────────────────────────────────────────────────────

  const handleRevokeRole = useCallback(
    async (assignment: UserRoleDetail) => {
      if (!target) return;

      try {
        await revokeRole({
          userId: target.id,
          roleId: assignment.roleId,
          scopeReferenceId:
            assignment.scopeReferenceId !== null
              ? assignment.scopeReferenceId
              : undefined,
        }).unwrap();

        notifyMutationSuccess("Role removed successfully.");
        // On 404 (already removed) we still consider it success — no special handling needed
        // since the cache invalidation will refetch and clean the list
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Action, method: "DELETE" },
        });
      }
    },
    [target, revokeRole, handleApiError],
  );

  // ── Form field handlers ─────────────────────────────────────────────────────

  const handleRoleSelect = useCallback((roleId: number | null) => {
    dispatch({ type: UserRoleAssignmentActionType.SetSelectedRoleId, roleId });
  }, []);

  const handleScopeRefSelect = useCallback((refId: number | null) => {
    dispatch({ type: UserRoleAssignmentActionType.SetSelectedScopeRefId, refId });
  }, []);

  // ── Close / reset ───────────────────────────────────────────────────────────

  const handleClose = useCallback(() => {
    dispatch({ type: UserRoleAssignmentActionType.Reset });
    onClose();
  }, [onClose]);

  void open;

  return {
    state: {
      assignments,
      isLoadingAssignments,
      selectedRoleId: formState.selectedRoleId,
      selectedScopeRefId: formState.selectedScopeRefId,
      roleOptions,
      scopeRefOptions,
      needsScopeRef,
      selectedRoleScope: selectedRole?.scope ?? null,
      isLoadingRoles,
      isScopeRefLoading,
      isAssigning,
      isRevoking,
    },
    actions: {
      handleAddRole,
      handleRevokeRole,
      handleRoleSelect,
      handleScopeRefSelect,
      handleClose,
      refetchAssignments,
    },
    flags: {
      hasAssignments: assignments.length > 0,
      canAdd:
        formState.selectedRoleId !== null &&
        (!needsScopeRef || formState.selectedScopeRefId !== null),
    },
  };
}
