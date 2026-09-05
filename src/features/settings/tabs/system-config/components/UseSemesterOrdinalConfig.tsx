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

function useSemesterOrdinalQuery(): GetQueryHookResponse<
  SystemConfig | undefined
> {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useListSystemConfigsQuery();

  const config = data?.member.find(
    (item) => item.configKey === "USE_SEMESTER_ORDINAL",
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

type UseSemesterOrdinalPayload =
  | ({ id: number } & UpdateSystemConfigRequest)
  | CreateSystemConfigRequest;

function useSemesterOrdinalPostMutation(): UploadMutationHookResponse<UseSemesterOrdinalPayload> {
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

function getUseSemesterOrdinalValue(data: SystemConfig | undefined): boolean {
  return Boolean(data?.configValue);
}

function buildUseSemesterOrdinalPayload(
  value: boolean,
  data: SystemConfig | undefined,
): UseSemesterOrdinalPayload {
  if (data) {
    return { id: data.id, configValue: value };
  }
  return {
    scope: "GLOBAL",
    referenceId: null,
    configKey: "USE_SEMESTER_ORDINAL",
    dataType: "BOOLEAN",
    configValue: value,
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export function UseSemesterOrdinalConfig() {
  const query = useSemesterOrdinalQuery();

  return (
    <ConfigItem<SystemConfig | undefined, UseSemesterOrdinalPayload>
      type="BOOLEAN"
      label="Use Semester Ordinal Numbers"
      useGetQuery={useSemesterOrdinalQuery}
      usePostMutation={useSemesterOrdinalPostMutation}
      getConfigValue={getUseSemesterOrdinalValue}
      postPayloadFormatter={(value) =>
        buildUseSemesterOrdinalPayload(value, query.data)
      }
      getSummary={(data) =>
        getUseSemesterOrdinalValue(data)
          ? "Enabled: Semesters are displayed using ordinal numbers (e.g. 1st Semester, 2nd Semester)."
          : "Disabled: Semesters are displayed using configured names."
      }
      onSuccess={() => notifyMutationSuccess("Semester ordinal configuration saved.")}
    />
  );
}
