import { useAppDispatch } from "@/app/hooks";
import { ExplainerBadge, ItemList, Panel } from "@/components/ui-kit";
import type { ItemListItem } from "@/components/ui-kit/data-display/ItemList";
import { roleSelected } from "@/features/auth/events";
import type { ApiRole } from "@/features/auth/types";
import useAuthState from "@/features/auth/use-auth-state";
import { CheckOutlined } from "@ant-design/icons";
import { Button, Flex, Modal, Typography } from "antd";
import { useState } from "react";

export function RolePicker() {
  const { roles, activeRole } = useAuthState();
  const dispatch = useAppDispatch();
  const [selectedRole, setSelectedRole] = useState<ApiRole | null>(activeRole);

  if (roles.length === 0) return null;

  const items: ItemListItem[] = roles.map((role) => ({
    key: role.name,
    content: (
      <Flex align="center" gap={8}>
        <Typography.Text strong>{role.name}</Typography.Text>
        <ExplainerBadge label={role.scope} intent="info" />
      </Flex>
    ),
    trailing: selectedRole?.name === role.name ? <CheckOutlined /> : null,
    onClick: () => setSelectedRole(role),
  }));

  return (
    <Modal open closable={false} maskClosable={false} footer={null} centered>
      <Panel
        title="Select your role"
        subtitle="Choose the role you want to operate under."
        footer={
          <Button
            type="primary"
            disabled={selectedRole === null}
            onClick={() => {
              if (selectedRole) dispatch(roleSelected(selectedRole));
            }}
          >
            Proceed
          </Button>
        }
      >
        <ItemList items={items} variant="simple" />
      </Panel>
    </Modal>
  );
}
