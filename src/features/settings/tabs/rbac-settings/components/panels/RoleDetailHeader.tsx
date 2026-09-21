import { useToken } from "@/shared/hooks/useToken";
import { LockOutlined } from "@ant-design/icons";
import { Flex, Tag, Typography } from "antd";
import type { Role } from "../../types/rbac";
import { ScopeBadge } from "../ScopeBadge";

type RoleDetailHeaderProps = {
  role?: Role | null;
  assignableByRoles?: string[];
};

export function RoleDetailHeader({ role, assignableByRoles = [] }: RoleDetailHeaderProps) {
  const token = useToken();

  if (!role) return null;

  return (
    <Flex vertical gap={8} style={{ width: "100%", paddingBottom: 12 }}>
      <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
        <Flex align="center" gap={10}>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {role.name}
          </Typography.Title>
          <ScopeBadge scope={role.scope} />
          {role.isSystem && (
            <Tag icon={<LockOutlined />} color="red">
              System Protected
            </Tag>
          )}
        </Flex>
      </Flex>

      {role.description && (
        <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
          {role.description}
        </Typography.Text>
      )}

      {assignableByRoles.length > 0 && (
        <Flex align="center" gap={6} wrap="wrap" style={{ marginTop: 4 }}>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM - 1, fontWeight: 600 }}
          >
            Assignable By:
          </Typography.Text>
          {assignableByRoles.map((parentRole) => (
            <Tag key={parentRole} color="blue" style={{ fontSize: token.fontSizeSM - 2, margin: 0 }}>
              {parentRole}
            </Tag>
          ))}
        </Flex>
      )}
    </Flex>
  );
}
