import { useIsMobile } from "@/hooks/useBreakpoint";
import {
  PROFILE_CHANGE_PASSWORD_DESCRIPTION,
  PROFILE_CHANGE_PASSWORD_TITLE,
  PROFILE_SECURITY_SECTION_TITLE,
} from "@/shared/constants/profilePageOptions";
import { DataLoader } from "@/shared/ui/DataLoader";
import { useToken } from "@/shared/hooks/useToken";
import { LockOutlined } from "@ant-design/icons";
import { Button, Card, Flex, Form, Input, Typography } from "antd";
import { useChangePasswordSection } from "../hooks/useChangePasswordSection";
import {
  changePasswordConfirmRules,
  currentPasswordRules,
  newPasswordRules,
} from "../utils/validators";

export function ChangePasswordSection() {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useChangePasswordSection();

  return (
    <Card
      title={PROFILE_SECURITY_SECTION_TITLE}
      bordered
      style={{
        width: "100%",
        height: "100%",
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorderSecondary,
      }}
    >
      <Flex vertical gap={token.paddingMD}>
        <Flex vertical gap={4}>
          <Typography.Text strong>{PROFILE_CHANGE_PASSWORD_TITLE}</Typography.Text>
          <Typography.Paragraph
            type="secondary"
            style={{ margin: 0, fontSize: token.fontSizeSM }}
          >
            {PROFILE_CHANGE_PASSWORD_DESCRIPTION}
          </Typography.Paragraph>
        </Flex>

        <DataLoader loading={flags.isLoading} minHeight="80px">
          <Form
            form={state.form}
            layout="vertical"
            onFinish={actions.handleSubmit}
            requiredMark={false}
            size={isMobile ? "large" : "middle"}
          >
            <Form.Item
              name="currentPassword"
              label="Current password"
              rules={currentPasswordRules}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
            </Form.Item>

            <Form.Item
              name="newPassword"
              label="New password"
              rules={newPasswordRules(() =>
                state.form.getFieldValue("currentPassword"),
              )}
              dependencies={["currentPassword"]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="At least 8 characters"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm new password"
              rules={changePasswordConfirmRules(() =>
                state.form.getFieldValue("newPassword"),
              )}
              dependencies={["newPassword"]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Re-enter new password"
                autoComplete="new-password"
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button
                type="primary"
                htmlType="submit"
                loading={flags.isLoading}
                block={isMobile}
              >
                Update password
              </Button>
            </Form.Item>
          </Form>
        </DataLoader>
      </Flex>
    </Card>
  );
}
