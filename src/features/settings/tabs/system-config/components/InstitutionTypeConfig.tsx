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
  InstitutionType,
  SystemConfig,
  UpdateSystemConfigRequest,
} from "../types/system-config";
import {
  INSTITUTION_TYPE_OPTIONS,
  getInstitutionTypeOption,
} from "@/shared/constants/institutionTypeOptions";
import { ConfigItem } from "./ConfigItem";

// ── RTK hook adapters (PictureUploader style) ─────────────────────────────────

function useInstitutionTypeQuery(): GetQueryHookResponse<
  SystemConfig | undefined
> {
  const { data, isLoading, isFetching, isError, error, refetch } =
    useListSystemConfigsQuery();

  const config = data?.member.find(
    (item) => item.configKey === "INSTITUTION_TYPE",
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

type InstitutionTypePayload =
  | ({ id: number } & UpdateSystemConfigRequest)
  | CreateSystemConfigRequest;

function useInstitutionTypePostMutation(): UploadMutationHookResponse<InstitutionTypePayload> {
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

function getInstitutionTypeValue(data: SystemConfig | undefined): InstitutionType {
  return (data?.configValue as InstitutionType) || "CONVENTIONAL";
}

function buildInstitutionTypePayload(
  value: string,
  data: SystemConfig | undefined,
): InstitutionTypePayload {
  if (data) {
    return { id: data.id, configValue: value };
  }
  return {
    scope: "GLOBAL",
    referenceId: null,
    configKey: "INSTITUTION_TYPE",
    dataType: "STRING",
    configValue: value,
  };
}

// ── Component ───────────────────────────────────────────────────────────────

export function InstitutionTypeConfig() {
  const query = useInstitutionTypeQuery();

  return (
    <ConfigItem<SystemConfig | undefined, InstitutionTypePayload>
      type="STRING"
      options={INSTITUTION_TYPE_OPTIONS}
      label="Institution Type"
      placeholder="Select institution type"
      style={{ minWidth: 280 }}
      useGetQuery={useInstitutionTypeQuery}
      usePostMutation={useInstitutionTypePostMutation}
      getConfigValue={getInstitutionTypeValue}
      postPayloadFormatter={(value) =>
        buildInstitutionTypePayload(value as string, query.data)
      }
      getSummary={(data) => {
        const val = getInstitutionTypeValue(data);
        const option = getInstitutionTypeOption(val);
        return option
          ? `${option.label}: ${option.description}`
          : "Not configured";
      }}
      onSuccess={() => notifyMutationSuccess("Institution type configuration saved.")}
    />
  );
}
