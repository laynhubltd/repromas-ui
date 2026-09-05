import type {
    GetQueryHookResponse,
    UploadMutationHookResponse,
} from "@/shared/types/pictureUploader";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import {
    useCreateSystemConfigMutation,
    useListSystemConfigsQuery,
    useUpdateSystemConfigMutation,
} from "../api/systemConfigApi";
import type { CreateSystemConfigRequest, SystemConfig, UpdateSystemConfigRequest } from "../types/system-config";
import { ConfigItem } from "./ConfigItem";

// ── RTK hook adapters (PictureUploader style) ─────────────────────────────────

function useForceCarryoverQuery(): GetQueryHookResponse<
  SystemConfig | undefined
> {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useListSystemConfigsQuery();

  const config = data?.member.find(
    (item) => item.configKey === "FORCE_CARRYOVER_FIRST",
  );

  return {
    data: config,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  };
}

type ForceCarryoverPayload =
  | ({ id: number } & UpdateSystemConfigRequest)
  | CreateSystemConfigRequest;

function useForceCarryoverPostMutation(): UploadMutationHookResponse<ForceCarryoverPayload> {
  const [update, { isLoading: isUpdating, error: updateError, isSuccess: isUpdateSuccess }] =
    useUpdateSystemConfigMutation();
  const [create, { isLoading: isCreating, error: createError, isSuccess: isCreateSuccess }] =
    useCreateSystemConfigMutation();

  return [
    (payload) => {
      if ("id" in payload) {
        return update(payload as { id: number } & UpdateSystemConfigRequest);
      }
      return create(payload as CreateSystemConfigRequest);
    },
    {
      isLoading: isUpdating || isCreating,
      error: updateError || createError,
      isSuccess: isUpdateSuccess || isCreateSuccess,
    },
  ];
}

// ── Adapters ──────────────────────────────────────────────────────────────────

function getForceCarryoverValue(data: SystemConfig | undefined): boolean {
  return Boolean(data?.configValue);
}

function buildForceCarryoverPayload(
  value: boolean,
  data: SystemConfig | undefined,
): ForceCarryoverPayload {
  if (data) {
    return { id: data.id, configValue: value };
  }
  return {
    scope: "GLOBAL",
    referenceId: null,
    configKey: "FORCE_CARRYOVER_FIRST",
    dataType: "BOOLEAN",
    configValue: value,
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export function ForceCarryoverConfig() {
  // Need query data for payload formatter — wrap in closure at render time
  const query = useForceCarryoverQuery();

  return (
    <ConfigItem<SystemConfig | undefined, ForceCarryoverPayload>
      type="BOOLEAN"
      label="Overwrite Carryover Marks"
      useGetQuery={useForceCarryoverQuery}
      usePostMutation={useForceCarryoverPostMutation}
      getConfigValue={getForceCarryoverValue}
      postPayloadFormatter={(value) =>
        buildForceCarryoverPayload(value, query.data)
      }
      getSummary={(data) =>
        getForceCarryoverValue(data) ? "Enabled" : "Disabled"
      }
      onSuccess={() => notifyMutationSuccess("Configuration saved.")}
    />
  );
}
