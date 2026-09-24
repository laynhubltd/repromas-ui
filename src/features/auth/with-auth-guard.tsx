import { useAppSelector } from "@/app/hooks";
import { appPaths } from "@/app/routing/app-path";
import type { ComponentType } from "react";
import { Suspense } from "react";
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

    // Wait for redux-persist rehydration before judging auth, then gate on
    // token PRESENCE only — never on client-clock expiry (isTokenExpired):
    // a skewed local clock made fresh tokens look expired and bounced users
    // straight back to /login. A genuinely stale token gets a 401 from the
    // server, which axiosBaseQuery resolves (refresh or logout).
    if (!rehydrated) return <>{fallback ?? null}</>;
    if (!token) return <Navigate to={appPaths.login} replace />;
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
