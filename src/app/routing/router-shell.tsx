import { Spin } from "antd";
import { Suspense } from "react";
import { Outlet, ScrollRestoration } from "react-router-dom";

export default function RouterShell() {
  return (
    <>
      <ScrollRestoration />
      <Suspense
        fallback={
          <Spin
            tip="Loading…"
            style={{ margin: "2rem auto", display: "block" }}
          />
        }
      >
        <Outlet />
      </Suspense>
    </>
  );
}
