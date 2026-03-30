import { useAppSelector } from "@/app/hooks";
import { appPaths } from "@/app/routing/app-path";
import { isTokenExpired } from "@/shared/utils/token-util";
import type { ComponentType } from "react";
import { Suspense, useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

type WithAuthGuardProps<T extends object> = {
  Component: ComponentType<T>;
  fallback?: React.ReactNode;
};

/**
 * Wraps a lazy-loaded component and ensures user is authenticated.
 */
export default function withAuthGuard<T extends object>(
  props: WithAuthGuardProps<T>,
) {
  const { Component, fallback } = props;

  function GuardedComponent(innerProps: T) {
    const token = useAppSelector((state) => state.auth.token);
    const rehydrated = useAppSelector(
      (state) => (state as RootWithPersist)._persist?.rehydrated ?? false,
    );
    const [checking, setChecking] = useState(true);
    const [authenticated, setAuthenticated] = useState(false);

    useEffect(() => {
      if (!rehydrated) return;
      const hasValidToken = !!token && !isTokenExpired(token);
      setAuthenticated(hasValidToken);
      setChecking(false);
    }, [rehydrated, token]);

    if (!rehydrated || checking) return <>{fallback ?? null}</>;
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

type RootWithPersist = {
  _persist?: { rehydrated?: boolean };
  auth: { token: string | null };
};
