export interface ApiErrorData {
  message: string;
  error?: string | Record<string, string[] | string>;
  statusCode?: number;
  timeStamp?: string;
  "x-request-id"?: string;
}

export interface ApiErrorResponse {
  status?: number | string;
  error?: string;
  message: string;
  timeStamp?: string;
  "x-request-id"?: string;
  errorFields?: Record<string, string>;
}
