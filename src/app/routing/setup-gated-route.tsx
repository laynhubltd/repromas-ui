import { PATH_TO_SETUP_STEP } from "@/features/tenant-setup/config/setupSteps";
import { useSetupGatedRoute } from "@/features/tenant-setup/hooks/useSetupGatedRoute";
import { DataLoader } from "@/shared/ui/DataLoader";
import type { SetupStepId } from "@/features/tenant-setup/types/setup";
import { Navigate, Outlet, useLocation } from "react-router-dom";

type SetupGatedRouteProps = {
  stepId?: SetupStepId;
};

export default function SetupGatedRoute({ stepId }: SetupGatedRouteProps) {
  const location = useLocation();
  const resolvedStepId =
    stepId ?? PATH_TO_SETUP_STEP[location.pathname];
  const { isBlocked, redirectTo, isLoading } =
    useSetupGatedRoute(resolvedStepId);

  return (
    <DataLoader loading={isLoading} minHeight="200px">
      {isBlocked ? (
        <Navigate
          to={`${redirectTo}?setupBlocked=${resolvedStepId ?? "unknown"}`}
          replace
        />
      ) : (
        <Outlet />
      )}
    </DataLoader>
  );
}
