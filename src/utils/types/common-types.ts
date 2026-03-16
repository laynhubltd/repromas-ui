export type MaybeNull<T> = T | null;

export type ApiErrorData = {
  error?: string | Record<string, string[]>;
  timeStamp?: string;
  "x-request-id"?: string;
};

export type ApiErrorResponse = {
  status?: number;
  error?: string;
  message: string;
  timeStamp?: string;
  "x-request-id"?: string;
  errorFields: Record<string, string>;
};
