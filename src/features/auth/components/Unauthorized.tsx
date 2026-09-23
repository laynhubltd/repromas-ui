import { ArrowLeftOutlined, LogoutOutlined } from "@ant-design/icons";
import { Button, Result, Typography } from "antd";
import { useNavigate } from "react-router-dom";

import { useLogoutMutation } from "@/features/auth/api/auth-api";

const { Text } = Typography;

/**
 * 403 screen. Best-practice framing: no blame, states the situation plainly,
 * and offers the two constructive exits — go back to where the user came
 * from, or sign out to switch to an account that has access. Never reveals
 * what the protected resource is.
 */
export default function Unauthorized() {
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();

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
        status="403"
        title="You don't have access to this page"
        subTitle="Your account doesn't have permission to view this. If you believe you should have access, contact your administrator."
        extra={[
          <Button
            key="back"
            type="primary"
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>,
          <Button
            key="logout"
            icon={<LogoutOutlined />}
            onClick={() => void logout()}
          >
            Log out
          </Button>,
        ]}
      >
        <div style={{ textAlign: "center" }}>
          <Text type="secondary">
            Signed in with the wrong account? Logging out lets you sign back in
            with one that has access.
          </Text>
        </div>
      </Result>
    </div>
  );
}
