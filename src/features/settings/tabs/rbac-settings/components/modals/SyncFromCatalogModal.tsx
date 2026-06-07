// Feature: rbac-settings
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { Alert, Button, Checkbox, Flex, Modal, Typography } from "antd";
import { useSyncFromCatalogModal } from "../../hooks/useSyncFromCatalogModal";
import type { SyncFromCatalogResponse } from "../../types/rbac";

export type SyncFromCatalogModalProps = {
  open: boolean;
  onClose: () => void;
};

const DISPLAY_LIMIT = 10;

function formatSlugList(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length <= DISPLAY_LIMIT) return items.join(", ");
  const shown = items.slice(0, DISPLAY_LIMIT).join(", ");
  return `${shown}, and ${items.length - DISPLAY_LIMIT} more`;
}

function SyncResultsSummary({ result }: { result: SyncFromCatalogResponse }) {
  const token = useToken();

  return (
    <Flex vertical gap={12}>
      <Typography.Text>
        Catalogue: {result.catalogueCreatedCount} created,{" "}
        {result.catalogueUpdatedCount} updated ({result.catalogueTotal} total).
      </Typography.Text>
      <Typography.Text>
        Tenant permissions: {result.tenantPermissionsCreatedCount} created,{" "}
        {result.tenantPermissionsSkippedCount} skipped.
      </Typography.Text>
      <Typography.Text>
        Assigned to System Administrator:{" "}
        {result.assignedToSystemAdministratorCount}.
      </Typography.Text>

      {result.warnings.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message="Warnings"
          description={
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {result.warnings.map((warning) => (
                <li key={warning}>{warning}</li>
              ))}
            </ul>
          }
        />
      )}

      {result.createdCatalogueSlugs.length > 0 && (
        <div>
          <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
            New catalogue slugs
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {formatSlugList(result.createdCatalogueSlugs)}
          </Typography.Text>
        </div>
      )}

      {result.createdTenantPermissions.length > 0 && (
        <div>
          <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
            Activated tenant permissions
          </Typography.Text>
          <Typography.Text
            type="secondary"
            style={{ fontSize: token.fontSizeSM }}
          >
            {result.createdTenantPermissions
              .slice(0, DISPLAY_LIMIT)
              .map((p) => p.slug)
              .join(", ")}
            {result.createdTenantPermissions.length > DISPLAY_LIMIT &&
              `, and ${result.createdTenantPermissions.length - DISPLAY_LIMIT} more`}
          </Typography.Text>
        </div>
      )}
    </Flex>
  );
}

export function SyncFromCatalogModal({
  open,
  onClose,
}: SyncFromCatalogModalProps) {
  const token = useToken();
  const { state, actions, flags } = useSyncFromCatalogModal(onClose);
  const { assignToSystemAdministrator, lastResult, isSyncing } = state;
  const {
    handleConfirm,
    handleCancel,
    handleDone,
    setAssignToSystemAdministrator,
  } = actions;
  const { isConfirmStep, isResultsStep } = flags;

  const title = isResultsStep
    ? "Sync complete"
    : "Sync permissions from catalogue";

  return (
    <Modal
      title={title}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={520}
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        {isConfirmStep && (
          <Flex vertical gap={16}>
            <Typography.Text>
              Updates the global permission catalogue from the code registry,
              creates missing permissions, and can automatically grant new
              permissions to the System Administrator role.
            </Typography.Text>
            <Checkbox
              checked={assignToSystemAdministrator}
              onChange={(e) => setAssignToSystemAdministrator(e.target.checked)}
            >
              Assign newly created permissions to System Administrator
            </Checkbox>
          </Flex>
        )}

        {isResultsStep && lastResult && (
          <SyncResultsSummary result={lastResult} />
        )}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        {isConfirmStep && (
          <PermissionGuard permission={Permission.PermissionsManage}>
            <Button
              type="primary"
              loading={isSyncing}
              disabled={isSyncing}
              onClick={handleConfirm}
              block
              style={{ height: 48, fontWeight: 600 }}
            >
              Sync from catalogue
            </Button>
          </PermissionGuard>
        )}

        {isResultsStep && (
          <Button
            type="primary"
            onClick={handleDone}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Done
          </Button>
        )}

        <Button
          type="text"
          block
          onClick={isResultsStep ? handleDone : handleCancel}
          disabled={isSyncing}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          {isResultsStep ? "Close" : "Cancel"}
        </Button>
      </div>
    </Modal>
  );
}
