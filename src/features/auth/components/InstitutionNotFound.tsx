import { DisconnectOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Result, Typography } from "antd";
import { useEffect } from "react";

const { Text } = Typography;

type InstitutionNotFoundProps = {
  tenantSlug: string;
};

/**
 * Shown when the app cannot resolve a portal for the current address.
 * Deliberately framed as a connection problem: the underlying cause
 * (tenant resolution) is an internal detail that would only alarm users,
 * and in practice the condition is usually transient (DNS/proxy/config
 * propagation). The slug is logged to the console for support triage but
 * never rendered.
 */
export default function InstitutionNotFound({
  tenantSlug,
}: InstitutionNotFoundProps) {
  useEffect(() => {
    // Support-facing diagnostic only — never shown in the UI.
    console.warn(
      `[portal] could not resolve a portal for "${tenantSlug}" (Ref: PORTAL-CONN)`,
    );
  }, [tenantSlug]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <Result
        icon={<DisconnectOutlined style={{ color: "#8c8c8c" }} />}
        title="We're having trouble connecting"
        subTitle="We couldn't reach your institution's portal. This is usually temporary — refreshing the page often resolves it."
        extra={
          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => window.location.reload()}
          >
            Refresh page
          </Button>
        }
      >
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">
            Still not working? Check the web address, or contact your
            institution&apos;s administrator and mention reference{" "}
            <Text code>PORTAL-CONN</Text>.
          </Text>
        </div>
      </Result>
    </div>
  );
}
