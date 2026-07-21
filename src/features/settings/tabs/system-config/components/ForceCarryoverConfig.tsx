import type {
    GetQueryHookResponse,
    UploadMutationHookResponse,
} from "@/shared/types/pictureUploader";
import { notifyMutationSuccess } from "@/shared/utils/feedback/notifyMutationSuccess";
import {
    useListSystemConfigsQuery,
    useUpdateSystemConfigMutation,
} from "../api/systemConfigApi";
import type { SystemConfig } from "../types/system-config";
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

function useForceCarryoverPostMutation(): UploadMutationHookResponse<{
  id: number;
  configValue: boolean;
}> {
  const [update, { isLoading, error, isSuccess }] =
    useUpdateSystemConfigMutation();

  return [(payload) => update(payload), { isLoading, error, isSuccess }];
}

// ── Adapters ──────────────────────────────────────────────────────────────────

function getForceCarryoverValue(data: SystemConfig | undefined): boolean {
  return Boolean(data?.configValue);
}

function buildForceCarryoverPayload(
  value: boolean,
  data: SystemConfig | undefined,
): { id: number; configValue: boolean } {
  if (!data) throw new Error("Configuration not found.");
  return { id: data.id, configValue: value };
}

// ── Component ───────────────────────────────────────────────────────────────

export function ForceCarryoverConfig() {
  // Need query data for payload formatter — wrap in closure at render time
  const query = useForceCarryoverQuery();

  return (
    <ConfigItem<SystemConfig | undefined, { id: number; configValue: boolean }>
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
