import { appPaths } from "@/app/routing/app-path";
import { Navigate, Outlet } from "react-router-dom";
import { useProfileGate } from "../hooks/useProfileGate";

export default function ProfileGate() {
  const { flags } = useProfileGate();

  if (flags.needsUpload) {
    return <Navigate to={appPaths.profile} replace />;
  }

  return <Outlet />;
}
