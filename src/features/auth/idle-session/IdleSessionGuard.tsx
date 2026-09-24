import { useAppSelector } from "@/app/hooks";
import { ClockCircleOutlined } from "@ant-design/icons";
import { Button, Modal, Typography } from "antd";
import { useCallback } from "react";

import { useLogoutMutation } from "@/features/auth/api/auth-api";
import {
  clearLastActivity,
  formatCountdown,
  markIdleLogoutReason,
} from "./idle-session";
import { useIdleSession } from "./useIdleSession";

const { Text, Title } = Typography;

/**
 * Mounts once in the root shell. Renders nothing while the user is active;
 * shows a countdown modal during the warning window; performs a LOUD logout
 * on expiry (server-side logout call + reason banner on the login page —
 * never a silent bounce).
 *
 * Only advisory UX: the server's refresh-token TTL remains the enforced
 * session boundary.
 */
export default function IdleSessionGuard() {
  const token = useAppSelector((state) => state.auth.token);
  const [logout] = useLogoutMutation();

  const handleExpire = useCallback(() => {
    markIdleLogoutReason();
    clearLastActivity();
    // The mutation ends the server session (refresh token) and clears client
    // auth on BOTH success and failure paths — routing then swaps to the
    // login tree reactively.
    void logout();
  }, [logout]);

  const { status, msRemaining, extend } = useIdleSession({
    enabled: !!token,
    onExpire: handleExpire,
  });

  if (!token) return null;

  return (
    <Modal
      open={status === "warning"}
      closable={false}
      maskClosable={false}
      keyboard={false}
      footer={null}
      width={420}
      centered
    >
      <div style={{ textAlign: "center", padding: "8px 0" }}>
        <ClockCircleOutlined style={{ fontSize: 40, color: "#faad14" }} />
        <Title level={4} style={{ marginTop: 16 }}>
          Are you still there?
        </Title>
        <Text type="secondary">
          You&apos;ve been inactive for a while. For your security, you&apos;ll
          be signed out in{" "}
          <Text strong>{formatCountdown(msRemaining)}</Text>.
        </Text>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
            marginTop: 24,
          }}
        >
          <Button type="primary" onClick={extend} autoFocus>
            Stay signed in
          </Button>
          <Button onClick={handleExpire}>Sign out now</Button>
        </div>
      </div>
    </Modal>
  );
}
