import { RequestScreen } from "@/shared/types/error-ui";
import { deriveSectionErrorMessage } from "@/shared/utils/error/deriveSectionErrorMessage";
import { useMemo } from "react";
import { useGetPaymentGatewayConfigQuery } from "../api/paymentGatewayConfigApi";

export function usePaymentGatewayConfigDrawer(
  configId: number | null,
  open: boolean,
) {
  const { data, isLoading, isError, error, refetch } =
    useGetPaymentGatewayConfigQuery(configId ?? 0, {
      skip: configId == null || !open,
    });

  const sectionError = useMemo(
    () =>
      deriveSectionErrorMessage(isError, error, {
        screen: RequestScreen.List,
        method: "GET",
      }),
    [isError, error],
  );

  return {
    state: {
      config: data ?? null,
      isLoading,
      isError,
      sectionError,
    },
    actions: { refetch },
  };
}
