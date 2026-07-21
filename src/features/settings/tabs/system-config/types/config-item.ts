import type { MenuProps } from "antd";
import type {
  GetQueryHookResponse,
  UploadMutationHookResponse,
} from "@/shared/types/pictureUploader";
import type { DataType } from "./system-config";

export type ConfigItemAction = NonNullable<MenuProps["items"]>[number];

export type PrimitiveConfigValueMap = {
  STRING: string;
  INTEGER: number;
  FLOAT: number;
  BOOLEAN: boolean;
};

export type PrimitiveDataType = keyof PrimitiveConfigValueMap;
export type PrimitiveConfigValue = PrimitiveConfigValueMap[PrimitiveDataType];
export type ActionBasedDataType = Extract<DataType, "ARRAY" | "JSON_OBJECT">;

type ConfigItemBaseProps = {
  label: string;
};

export type PrimitiveConfigItemProps<
  T extends PrimitiveDataType,
  TData = unknown,
  TPayload = unknown,
> = ConfigItemBaseProps & {
  type: T;
  useGetQuery: () => GetQueryHookResponse<TData>;
  usePostMutation: () => UploadMutationHookResponse<TPayload>;
  getConfigValue: (data: TData | undefined) => PrimitiveConfigValueMap[T];
  postPayloadFormatter: (value: PrimitiveConfigValueMap[T]) => TPayload;
  getSummary?: (data: TData | undefined) => string | null;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number;
};

export type ActionBasedConfigItemProps<T extends ActionBasedDataType> =
  ConfigItemBaseProps & {
    type: T;
    actions: ConfigItemAction[];
    summary?: string | null;
    isNotConfigured?: boolean;
  };

export type ConfigItemProps<TData = unknown, TPayload = unknown> =
  | PrimitiveConfigItemProps<"STRING", TData, TPayload>
  | PrimitiveConfigItemProps<"INTEGER", TData, TPayload>
  | PrimitiveConfigItemProps<"FLOAT", TData, TPayload>
  | PrimitiveConfigItemProps<"BOOLEAN", TData, TPayload>
  | ActionBasedConfigItemProps<"ARRAY">
  | ActionBasedConfigItemProps<"JSON_OBJECT">;

export function isActionBasedConfigItem<TData = unknown, TPayload = unknown>(
  props: ConfigItemProps<TData, TPayload>,
): props is ActionBasedConfigItemProps<ActionBasedDataType> {
  return props.type === "ARRAY" || props.type === "JSON_OBJECT";
}

export type AnyPrimitiveConfigItemProps<TData = unknown, TPayload = unknown> =
  | PrimitiveConfigItemProps<"STRING", TData, TPayload>
  | PrimitiveConfigItemProps<"INTEGER", TData, TPayload>
  | PrimitiveConfigItemProps<"FLOAT", TData, TPayload>
  | PrimitiveConfigItemProps<"BOOLEAN", TData, TPayload>;
