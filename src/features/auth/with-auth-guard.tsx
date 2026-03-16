import useAuth from "@/features/auth/use-auth";
import { appPaths } from "@/routing/app-path";
import { isTokenExpired } from "@/utils/token-util";
import type { ComponentType } from "react";
import { Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

type WithAuthGuardProps<T extends object> = {
  Component: ComponentType<T>;
  fallback?: React.ReactNode;
};

/**
 * Wraps a lazy-loaded component and ensures user is authenticated (and optional token refresh).
 */
export default function withAuthGuard<T extends object>(
  props: WithAuthGuardProps<T>,
) {
  const { Component, fallback } = props;

  function GuardedComponent(innerProps: T) {
    const { token, tryRefreshToken } = useAuth();
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
      let cancelled = false;
      const run = async () => {
        if (!token) {
          if (!cancelled) setChecking(false);
          return;
        }
        if (isTokenExpired(token) && tryRefreshToken) {
          try {
            await tryRefreshToken();
          } catch {
            if (!cancelled) setAuthenticated(false);
            if (!cancelled) setChecking(false);
            return;
          }
        }
        if (!cancelled) {
          setAuthenticated(true);
          setChecking(false);
        }
      };
      run();
      return () => {
        cancelled = true;
      };
    }, [token, tryRefreshToken]);

    if (checking) return <>{fallback ?? null}</>;
    if (!token || !authenticated)
      return <Navigate to={appPaths.login} replace />;
    return (
      <Suspense fallback={fallback ?? null}>
        <Component {...innerProps} />
      </Suspense>
    );
  }

  return GuardedComponent;
}
