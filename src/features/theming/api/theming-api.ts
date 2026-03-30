import { baseApi } from "@/app/api/baseApi";
import type { AppDispatch } from "@/app/store";
import { brandingLoaded, themeLoaded } from "@/app/state/theme-slice";
import type { BrandConfigResponse } from "@/features/theming/types";
import { ApiTagTypes } from "@/shared/types/apiTagTypes";

const themingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getBrandConfig: builder.query<BrandConfigResponse, void>({
      query: () => ({ url: "/brand-config", method: "GET" }),
      providesTags: [ApiTagTypes.Theme],
      async onQueryStarted(
        _arg,
        {
          dispatch,
          queryFulfilled,
        }: {
          dispatch: AppDispatch;
          queryFulfilled: Promise<{ data: BrandConfigResponse }>;
        },
      ) {
        try {
          const { data } = await queryFulfilled;
          const cfg = data.configValue;

          if (cfg.primaryColor) {
            dispatch(themeLoaded(cfg.primaryColor));
          }
          dispatch(
            brandingLoaded({
              systemName: cfg.systemName ?? undefined,
              schoolName: cfg.schoolName ?? undefined,
              tagline: cfg.tagline ?? undefined,
              logoUrl: cfg.logoUrl ?? undefined,
              tenantName: cfg.tenantName ?? undefined,
            }),
          );
        } catch {
          // silent — slice retains DEFAULT_PRIMARY
        }
      },
    }),
  }),
});

export const { useGetBrandConfigQuery } = themingApi;
