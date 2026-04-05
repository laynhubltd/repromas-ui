import FullscreenLoader from "@/components/system/FullscreenLoader";
import { Suspense, useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";

export default function RouterShell() {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  }, [location.pathname]);

  return (
    <>
      <Suspense
        fallback={<FullscreenLoader label="Loading..." />}
      >
        <Outlet />
      </Suspense>
    </>
  );
}
