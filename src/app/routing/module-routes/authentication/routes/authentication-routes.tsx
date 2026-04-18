import { appPaths } from "@/app/routing/app-path";
import { lazy } from "react";
import { Navigate, Route } from "react-router-dom";

const Login = lazy(() => import("@/features/auth/components/Login"));
const SignUp = lazy(() => import("@/features/auth/components/SignUp"));
const ForgotPassword = lazy(() => import("@/features/auth/components/ForgotPassword"));
const Unauthorized = lazy(() => import("@/features/auth/components/Unauthorized"));

export function getAuthenticationRoutes() {
    return (
        <>
            <Route>
                <Route index element={<Navigate to={appPaths.login} replace />} />
                <Route path={appPaths.login} element={<Login />} />
                <Route path={appPaths.signUp} element={<SignUp />} />
                <Route path={appPaths.forgotPassword} element={<ForgotPassword />} />
                <Route path={appPaths.unauthorized} element={<Unauthorized />} />
                <Route path="*" element={<Navigate to={appPaths.login} replace />} />
            </Route>
        </>
    )
}