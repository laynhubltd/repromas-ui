import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Alert, Flex, Tooltip, Transfer, Typography } from "antd";
import type { TransferDirection } from "antd/es/transfer";
import React from "react";
import { useRoleAuthorityMatrix, type TransferRoleItem } from "../../hooks/useRoleAuthorityMatrix";
import type { RoleScope } from "../../types/rbac";
import { ScopeBadge } from "../ScopeBadge";

type RoleAuthorityMatrixTabProps = {
  roleId: number | null;
  readOnly?: boolean;
};

export function RoleAuthorityMatrixTab({
  roleId,
  readOnly = false,
}: RoleAuthorityMatrixTabProps) {
  const token = useToken();
  const { state, actions } = useRoleAuthorityMatrix(roleId);
  const { currentRole, dataSource, targetKeys, isLoading, isMutating } = state;
  const { handleTransferChange } = actions;

  const handleChange = (
    nextTargetKeys: React.Key[],
    direction: TransferDirection,
    moveKeys: React.Key[],
  ) => {
    if (readOnly) return;
    handleTransferChange(
      nextTargetKeys.map(String),
      direction,
      moveKeys.map(String),
    );
  };

  const renderItem = (item: TransferRoleItem) => {
    const content = (
      <Flex align="center" justify="space-between" style={{ width: "100%", paddingRight: 4 }}>
        <span style={{ fontSize: token.fontSizeSM, fontWeight: item.disabled ? 400 : 500 }}>
          {item.title}
        </span>
        <ScopeBadge scope={item.scope as RoleScope} />
      </Flex>
    );

    if (item.disabled && item.disabledReason) {
      return (
        <Tooltip title={item.disabledReason} placement="topLeft">
          <div style={{ width: "100%", opacity: 0.6, cursor: "not-allowed" }}>
            {content}
          </div>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <DataLoader loading={isLoading} loader={<SkeletonRows count={5} variant="card" />}>
      <Flex vertical gap={16}>
        <Alert
          type="info"
          showIcon
          message="Delegated Authority Range Matrix (ARBAC97)"
          description={
            <span>
              Configure which roles an officer holding{" "}
              <strong>{currentRole?.name ?? "this role"}</strong> is authorized to assign.
              System roles and self-delegation are restricted by administrative policy.
            </span>
          }
        />

        {readOnly && (
          <Alert
            type="warning"
            showIcon
            message="Read-Only View"
            description="Only Global System Administrators can modify authority range matrix mappings."
          />
        )}

        <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
          <Transfer
            dataSource={dataSource}
            targetKeys={targetKeys}
            onChange={handleChange}
            render={renderItem}
            titles={["Available Roles", "Assignable Authority Range"]}
            showSearch
            filterOption={(inputValue, item) =>
              item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
              item.scope.toLowerCase().includes(inputValue.toLowerCase())
            }
            disabled={readOnly || isMutating}
            listStyle={{
              width: 320,
              height: 420,
            }}
            locale={{
              itemUnit: "role",
              itemsUnit: "roles",
              searchPlaceholder: "Search roles…",
              notFoundContent: (
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  No roles found
                </Typography.Text>
              ),
            }}
          />
        </div>
      </Flex>
    </DataLoader>
  );
}
