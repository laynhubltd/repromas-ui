import FullscreenLoader from "@/components/system/FullscreenLoader";
import IdleSessionGuard from "@/features/auth/idle-session/IdleSessionGuard";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function RouterShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <>
      {/* Inactivity tracking — renders nothing until a session exists. */}
      <IdleSessionGuard />
      <Suspense
        fallback={<FullscreenLoader label="Loading..." />}
      >
        <Outlet />
      </Suspense>
    </>
  );
}
