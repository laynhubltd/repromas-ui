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

function useHasLevelCategoryQuery(): GetQueryHookResponse<
  SystemConfig | undefined
> {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useListSystemConfigsQuery();

  const config = data?.member.find(
    (item) => item.configKey === "HAS_LEVEL_CATEGORY",
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

type HasLevelCategoryPayload =
  | ({ id: number } & UpdateSystemConfigRequest)
  | CreateSystemConfigRequest;

function useHasLevelCategoryPostMutation(): UploadMutationHookResponse<HasLevelCategoryPayload> {
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

function getHasLevelCategoryValue(data: SystemConfig | undefined): boolean {
  return Boolean(data?.configValue);
}

function buildHasLevelCategoryPayload(
  value: boolean,
  data: SystemConfig | undefined,
): HasLevelCategoryPayload {
  if (data) {
    return { id: data.id, configValue: value };
  }
  return {
    scope: "GLOBAL",
    referenceId: null,
    configKey: "HAS_LEVEL_CATEGORY",
    dataType: "BOOLEAN",
    configValue: value,
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export function HasLevelCategoryConfig() {
  // Need query data for payload formatter — wrap in closure at render time
  const query = useHasLevelCategoryQuery();

  return (
    <ConfigItem<SystemConfig | undefined, HasLevelCategoryPayload>
      type="BOOLEAN"
      label="Enable Level Categories"
      useGetQuery={useHasLevelCategoryQuery}
      usePostMutation={useHasLevelCategoryPostMutation}
      getConfigValue={getHasLevelCategoryValue}
      postPayloadFormatter={(value) =>
        buildHasLevelCategoryPayload(value, query.data)
      }
      getSummary={(data) =>
        getHasLevelCategoryValue(data)
          ? "Enabled: Levels must belong to a category. Rank order is per-category."
          : "Disabled: Levels operate as a flat list."
      }
      onSuccess={() => notifyMutationSuccess("Configuration saved.")}
    />
  );
}
