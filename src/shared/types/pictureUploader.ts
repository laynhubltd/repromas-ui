export type GetQueryHookResponse<TData = unknown> = {
  data?: TData;
  isLoading: boolean;
  isFetching?: boolean;
  isError?: boolean;
  error?: unknown;
  refetch?: () => void;
};

export type PictureUploadMutationResult = Promise<{
  data?: unknown;
  error?: unknown;
}>;

export type UploadMutationHookResponse<TPayload = unknown> = readonly [
  (payload: TPayload) => PictureUploadMutationResult,
  { isLoading: boolean; error?: unknown; isSuccess?: boolean },
];

export type PictureUploaderProps<TData = unknown, TPayload = unknown> = {
  /** RTK Query hook for fetching the current picture metadata / URL. */
  useGetQuery: () => GetQueryHookResponse<TData>;
  /** RTK Query mutation hook for uploading a cropped image. */
  useUploadMutation: () => UploadMutationHookResponse<TPayload>;
  /** Resolve the image URL from the get-query data. */
  getExistingImageUrl?: (data: TData | undefined) => string | null | undefined;
  /** Shape the upload request payload (defaults to FormData with a `file` field). */
  uploadPayloadFormatter?: (file: File) => TPayload | Promise<TPayload>;
  onSuccess?: () => void;
  onError?: (error: unknown) => void;
  title?: string;
  description?: string;
  maxSizeMB?: number;
  aspectRatio?: number;
  outputWidth?: number;
  outputHeight?: number;
};
