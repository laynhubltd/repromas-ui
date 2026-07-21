import { getQueryHttpStatus } from "@/features/student-home/utils/getQueryHttpStatus";
import { useApiError } from "@/shared/hooks/useApiError";
import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import {
  mutationSuccessMessage,
  notifyMutationSuccess,
} from "@/shared/utils/feedback/notifyMutationSuccess";
import { useCallback, useEffect, useMemo, useReducer } from "react";
import {
  useCreateSignatoriesMutation,
  useGetSignatoriesQuery,
  useUpdateSignatoriesMutation,
  useUploadSignatureMutation,
} from "../api/signatoriesApi";
import { useGetUsersQuery } from "../api/usersApi";
import {
  SignatoriesConfigActionType,
  initialSignatoriesConfigState,
  signatoriesConfigReducer,
} from "../state/signatoriesConfigState";
import type {
  ApplyToValue,
  LocalSignatoryEntry,
  SignatoryEntry,
  SignatoryPayloadItem,
} from "../types/signatories";
import { SIGNATURE_ACCEPT_MIME_TYPES } from "../types/signatories";
import { useGetRolesQuery } from "@/features/settings/tabs/rbac-settings/api/rbacSettingsApi";

// ── Step 2 form values (passed from the modal view) ──────────────────────────

export type SignatoryStep2Values = {
  name: string;
  position: string;
  qualification: string;
  title: string;
  applyTo: ApplyToValue[];
  order: number;
  isActive: boolean;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function generateLocalId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function mapEntriesToPayload(list: LocalSignatoryEntry[]): SignatoryPayloadItem[] {
  return list.map((item) => ({
    userId: item.userId,
    roleId: item.roleId,
    signature: item.storagePath,
    name: item.name.trim() || null,
    position: item.position.trim() || null,
    qualification: item.qualification.trim() || null,
    title: item.title.trim() || null,
    applyTo: item.applyTo,
    order: item.order,
    isActive: item.isActive,
  }));
}

// ── Datasource query params (stable references) ───────────────────────────────

const USERS_QUERY = { itemsPerPage: 200 } as const;
const ROLES_QUERY = { itemsPerPage: 200 } as const;

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSignatoriesConfig() {
  const handleApiError = useApiError();

  const [state, dispatch] = useReducer(
    signatoriesConfigReducer,
    initialSignatoriesConfigState,
  );

  // ── Datasource fetches (parallel) ─────────────────────────────────────────

  const {
    data: signatoriesData,
    isLoading: isSignatoriesLoading,
    isFetching: isSignatoriesFetching,
    isError: isSignatoriesError,
    error: signatoriesError,
    refetch,
  } = useGetSignatoriesQuery();

  const { data: usersData, isLoading: isUsersLoading } =
    useGetUsersQuery(USERS_QUERY);

  const { data: rolesData, isLoading: isRolesLoading } =
    useGetRolesQuery(ROLES_QUERY);

  // ── Mutations ─────────────────────────────────────────────────────────────

  const [createSignatories, { isLoading: isCreating }] =
    useCreateSignatoriesMutation();
  const [updateSignatories, { isLoading: isUpdating }] =
    useUpdateSignatoriesMutation();
  const [uploadSignature, { isLoading: isUploadingSignature }] =
    useUploadSignatureMutation();

  // ── Derived values ────────────────────────────────────────────────────────

  const queryStatus = getQueryHttpStatus(signatoriesError);
  const isNotConfigured = isSignatoriesError && queryStatus === 404;

  const userOptions = useMemo(
    () =>
      (usersData?.member ?? []).map((u) => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName} (${u.email})`,
      })),
    [usersData?.member],
  );

  const roleOptions = useMemo(
    () =>
      (rolesData?.member ?? []).map((r) => ({
        value: r.id,
        label: r.name,
      })),
    [rolesData?.member],
  );

  const userMap = useMemo(
    () =>
      new Map(
        (usersData?.member ?? []).map((u) => [
          u.id,
          `${u.firstName} ${u.lastName} (${u.email})`,
        ]),
      ),
    [usersData?.member],
  );

  const roleMap = useMemo(
    () =>
      new Map((rolesData?.member ?? []).map((r) => [r.id, r.name])),
    [rolesData?.member],
  );

  const sectionError = useMemo(() => {
    if (!isSignatoriesError || isNotConfigured) return null;
    return deriveSectionErrorMessage(isSignatoriesError, signatoriesError, {
      screen: RequestScreen.List,
      method: "GET",
    });
  }, [isSignatoriesError, isNotConfigured, signatoriesError]);

  // ── Sync API response → local list ────────────────────────────────────────

  useEffect(() => {
    if (signatoriesData?.configValue?.signatories) {
      const list: LocalSignatoryEntry[] =
        signatoriesData.configValue.signatories.map((entry) => ({
          _localId: generateLocalId(),
          userId: entry.userId,
          roleId: entry.roleId,
          userLabel:
            entry.userSnapshot
              ? `${entry.userSnapshot.email}`
              : `User #${entry.userId}`,
          roleLabel:
            entry.roleSnapshot?.name ?? `Role #${entry.roleId}`,
          name: entry.name ?? "",
          position: entry.position ?? "",
          qualification: entry.qualification ?? "",
          title: entry.title ?? "",
          storagePath: entry.signature,
          publicUrl: entry.signatureUrl ?? "",
          applyTo: entry.applyTo,
          order: entry.order,
          isActive: entry.isActive,
        }));

      dispatch({
        type: SignatoriesConfigActionType.SyncFromConfig,
        list,
        isCreate: false,
      });
      return;
    }

    if (isNotConfigured) {
      dispatch({
        type: SignatoriesConfigActionType.SyncFromConfig,
        list: [],
        isCreate: true,
      });
    }
  }, [signatoriesData, isNotConfigured]);

  // ── Modal controls ────────────────────────────────────────────────────────

  const handleOpenAdd = useCallback(() => {
    dispatch({ type: SignatoriesConfigActionType.OpenAdd });
  }, []);

  const handleOpenEdit = useCallback((target: LocalSignatoryEntry) => {
    dispatch({ type: SignatoriesConfigActionType.OpenEdit, target });
  }, []);

  const handleCloseModal = useCallback(() => {
    dispatch({ type: SignatoriesConfigActionType.CloseModal });
  }, []);

  // ── Step 1 — signature upload ─────────────────────────────────────────────

  const handleUploadSignature = useCallback(
    async (file: File, userId: number, roleId: number): Promise<boolean> => {
      const acceptedTypes = SIGNATURE_ACCEPT_MIME_TYPES as readonly string[];
      if (!acceptedTypes.includes(file.type)) {
        handleApiError(
          new Error("Only PNG and JPEG images are supported for signatures."),
          { context: { screen: RequestScreen.Modal, method: "POST" } },
        );
        return false;
      }

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("userId", String(userId));
        formData.append("roleId", String(roleId));

        const result = await uploadSignature(formData).unwrap();

        dispatch({
          type: SignatoriesConfigActionType.SetStep1Complete,
          result: { ...result, userId, roleId },
        });
        return true;
      } catch (err: unknown) {
        handleApiError(err, {
          context: { screen: RequestScreen.Modal, method: "POST" },
        });
        return false;
      }
    },
    [uploadSignature, handleApiError],
  );

  // ── Step 1 edit — skip re-upload (carry existing storagePath forward) ─────

  const handleSkipUpload = useCallback(() => {
    if (!state.editTarget) return;
    dispatch({
      type: SignatoriesConfigActionType.SetStep1Complete,
      result: {
        storagePath: state.editTarget.storagePath,
        publicUrl: state.editTarget.publicUrl,
        userId: state.editTarget.userId,
        roleId: state.editTarget.roleId,
      },
    });
  }, [state.editTarget]);

  // ── Step 2 — append or update local list ─────────────────────────────────

  const handleCommitEntry = useCallback(
    (values: SignatoryStep2Values) => {
      if (!state.step1Result) return;

      const { userId, roleId, storagePath, publicUrl } = state.step1Result;

      if (state.editTarget) {
        // Update existing entry
        const updated: LocalSignatoryEntry = {
          ...state.editTarget,
          userId,
          roleId,
          userLabel: userMap.get(userId) ?? `User #${userId}`,
          roleLabel: roleMap.get(roleId) ?? `Role #${roleId}`,
          name: values.name,
          position: values.position,
          qualification: values.qualification,
          title: values.title,
          storagePath,
          publicUrl,
          applyTo: values.applyTo,
          order: values.order,
          isActive: values.isActive,
        };
        dispatch({ type: SignatoriesConfigActionType.UpdateEntry, entry: updated });
      } else {
        // Add new entry
        const entry: LocalSignatoryEntry = {
          _localId: generateLocalId(),
          userId,
          roleId,
          userLabel: userMap.get(userId) ?? `User #${userId}`,
          roleLabel: roleMap.get(roleId) ?? `Role #${roleId}`,
          name: values.name,
          position: values.position,
          qualification: values.qualification,
          title: values.title,
          storagePath,
          publicUrl,
          applyTo: values.applyTo,
          order: values.order,
          isActive: values.isActive,
        };
        dispatch({ type: SignatoriesConfigActionType.AddEntry, entry });
      }
    },
    [state.step1Result, state.editTarget, userMap, roleMap],
  );

  // ── Remove from local list ────────────────────────────────────────────────

  const handleRemoveEntry = useCallback((localId: string) => {
    dispatch({ type: SignatoriesConfigActionType.RemoveEntry, localId });
  }, []);

  // ── Persist — POST or PUT with retry logic ────────────────────────────────

  const persistSignatories = useCallback(
    async (isCreate: boolean): Promise<void> => {
      const payload = {
        signatories: mapEntriesToPayload(state.localList),
      };

      const mapSynced = (entries: SignatoryEntry[]): LocalSignatoryEntry[] =>
        entries.map((entry) => ({
          _localId: generateLocalId(),
          userId: entry.userId,
          roleId: entry.roleId,
          userLabel: entry.userSnapshot?.email ?? `User #${entry.userId}`,
          roleLabel: entry.roleSnapshot?.name ?? `Role #${entry.roleId}`,
          name: entry.name ?? "",
          position: entry.position ?? "",
          qualification: entry.qualification ?? "",
          title: entry.title ?? "",
          storagePath: entry.signature,
          publicUrl: entry.signatureUrl ?? "",
          applyTo: entry.applyTo,
          order: entry.order,
          isActive: entry.isActive,
        }));

      if (isCreate) {
        try {
          const result = await createSignatories(payload).unwrap();
          dispatch({ type: SignatoriesConfigActionType.SetIsCreate, value: false });
          dispatch({ type: SignatoriesConfigActionType.SyncAfterSave, list: mapSynced(result.configValue.signatories) });
        } catch (err: unknown) {
          if (getQueryHttpStatus(err) === 409) {
            dispatch({ type: SignatoriesConfigActionType.SetIsCreate, value: false });
            const result = await updateSignatories(payload).unwrap();
            dispatch({ type: SignatoriesConfigActionType.SyncAfterSave, list: mapSynced(result.configValue.signatories) });
            return;
          }
          throw err;
        }
      } else {
        try {
          const result = await updateSignatories(payload).unwrap();
          dispatch({ type: SignatoriesConfigActionType.SyncAfterSave, list: mapSynced(result.configValue.signatories) });
        } catch (err: unknown) {
          if (getQueryHttpStatus(err) === 404) {
            dispatch({ type: SignatoriesConfigActionType.SetIsCreate, value: true });
            const result = await createSignatories(payload).unwrap();
            dispatch({ type: SignatoriesConfigActionType.SetIsCreate, value: false });
            dispatch({ type: SignatoriesConfigActionType.SyncAfterSave, list: mapSynced(result.configValue.signatories) });
            return;
          }
          throw err;
        }
      }
    },
    [state.localList, createSignatories, updateSignatories],
  );

  const handleSave = useCallback(async (): Promise<boolean> => {
    try {
      await persistSignatories(state.isCreate);
      notifyMutationSuccess(mutationSuccessMessage("Signatories", "saved"));
      return true;
    } catch (err: unknown) {
      handleApiError(err, {
        context: {
          screen: RequestScreen.Action,
          method: state.isCreate ? "POST" : "PUT",
        },
      });
      return false;
    }
  }, [persistSignatories, state.isCreate, handleApiError]);

  // ── Derived flags ─────────────────────────────────────────────────────────

  const isDatasourceLoading = isUsersLoading || isRolesLoading;
  const isSaving = isCreating || isUpdating;
  const isLoading = isSignatoriesLoading || isSignatoriesFetching;

  return {
    state: {
      localList: state.localList,
      modalOpen: state.modalOpen,
      modalStep: state.modalStep,
      step1Result: state.step1Result,
      editTarget: state.editTarget,
      userOptions,
      roleOptions,
      sectionError,
      isLoading,
      isDatasourceLoading,
      isSaving,
      isUploadingSignature,
    },
    actions: {
      handleOpenAdd,
      handleOpenEdit,
      handleCloseModal,
      handleUploadSignature,
      handleSkipUpload,
      handleCommitEntry,
      handleRemoveEntry,
      handleSave,
      refetch,
    },
    flags: {
      isNotConfigured,
      hasSignatories: state.localList.length > 0,
      isEditMode: state.editTarget !== null,
    },
  };
}
