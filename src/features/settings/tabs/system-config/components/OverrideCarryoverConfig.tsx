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
import type {
  CreateSystemConfigRequest,
  SystemConfig,
  UpdateSystemConfigRequest,
} from "../types/system-config";
import { ConfigItem } from "./ConfigItem";

// ── RTK hook adapters (PictureUploader style) ─────────────────────────────────

function useOverrideCarryoverQuery(): GetQueryHookResponse<
  SystemConfig | undefined
> {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useListSystemConfigsQuery();

  const config = data?.member.find(
    (item) => item.configKey === "OVERRIDE_CARRYOVER",
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

type OverrideCarryoverPayload =
  | ({ id: number } & UpdateSystemConfigRequest)
  | CreateSystemConfigRequest;

function useOverrideCarryoverPostMutation(): UploadMutationHookResponse<OverrideCarryoverPayload> {
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

function getOverrideCarryoverValue(data: SystemConfig | undefined): boolean {
  return Boolean(data?.configValue);
}

function buildOverrideCarryoverPayload(
  value: boolean,
  data: SystemConfig | undefined,
): OverrideCarryoverPayload {
  if (data) {
    return { id: data.id, configValue: value };
  }
  return {
    scope: "GLOBAL",
    referenceId: null,
    configKey: "OVERRIDE_CARRYOVER",
    dataType: "BOOLEAN",
    configValue: value,
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export function OverrideCarryoverConfig() {
  const query = useOverrideCarryoverQuery();

  return (
    <ConfigItem<SystemConfig | undefined, OverrideCarryoverPayload>
      type="BOOLEAN"
      label="Override Carryover Courses"
      useGetQuery={useOverrideCarryoverQuery}
      usePostMutation={useOverrideCarryoverPostMutation}
      getConfigValue={getOverrideCarryoverValue}
      postPayloadFormatter={(value) =>
        buildOverrideCarryoverPayload(value, query.data)
      }
      getSummary={(data) =>
        getOverrideCarryoverValue(data)
          ? "Enabled: Carryover courses can be overridden during course registration."
          : "Disabled: Carryover courses cannot be overridden."
      }
      onSuccess={() => notifyMutationSuccess("Carryover override configuration saved.")}
    />
  );
}
