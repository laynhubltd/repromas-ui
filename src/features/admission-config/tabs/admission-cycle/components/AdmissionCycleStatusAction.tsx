import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  ADMISSION_CYCLE_ROLLBACKS,
  ADMISSION_CYCLE_TRANSITIONS,
} from "@/shared/constants/admissionCycleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  DeleteOutlined,
  EditOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import { Button, Dropdown } from "antd";
import type { MenuProps } from "antd";
import type { AdmissionCycleRow } from "../hooks/useAdmissionCycleTab";
import type { TransitionDirection } from "../types/admission-cycle";

type AdmissionCycleRowActionsProps = {
  cycle: AdmissionCycleRow;
  onEdit: (cycle: AdmissionCycleRow) => void;
  onDelete: (cycle: AdmissionCycleRow) => void;
  onTransition: (cycle: AdmissionCycleRow, direction: TransitionDirection) => void;
};

export function AdmissionCycleRowActions({
  cycle,
  onEdit,
  onDelete,
  onTransition,
}: AdmissionCycleRowActionsProps) {
  const token = useToken();

  const forwardMeta =
    cycle.status !== "CLOSED"
      ? ADMISSION_CYCLE_TRANSITIONS[cycle.status]
      : null;
  const rollbackMeta =
    cycle.status !== "PRE_PROCESSING"
      ? ADMISSION_CYCLE_ROLLBACKS[cycle.status]
      : null;

  const menuItems: MenuProps["items"] = [
    {
      key: "edit",
      label: (
        <PermissionGuard permission={Permission.AdmissionCyclesUpdate}>
          <span>Edit</span>
        </PermissionGuard>
      ),
      icon: <EditOutlined />,
      onClick: () => onEdit(cycle),
    },
    ...(forwardMeta
      ? [
          {
            key: "transition-forward",
            label: (
              <PermissionGuard permission={Permission.AdmissionCyclesTransition}>
                <span>{forwardMeta.buttonLabel}</span>
              </PermissionGuard>
            ),
            icon: <ArrowRightOutlined />,
            onClick: () => onTransition(cycle, "forward"),
          },
        ]
      : []),
    ...(rollbackMeta
      ? [
          {
            key: "transition-rollback",
            label: (
              <PermissionGuard permission={Permission.AdmissionCyclesTransition}>
                <span>{rollbackMeta.buttonLabel}</span>
              </PermissionGuard>
            ),
            icon: <ArrowLeftOutlined />,
            onClick: () => onTransition(cycle, "rollback"),
          },
        ]
      : []),
    {
      type: "divider" as const,
    },
    {
      key: "delete",
      label: (
        <PermissionGuard permission={Permission.AdmissionCyclesDelete}>
          <span style={{ color: token.colorError }}>Delete</span>
        </PermissionGuard>
      ),
      icon: <DeleteOutlined style={{ color: token.colorError }} />,
      onClick: () => onDelete(cycle),
      danger: true,
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
      <Button
        type="text"
        size="small"
        icon={<MoreOutlined style={{ fontSize: 16 }} />}
        style={{ color: token.colorTextTertiary }}
        aria-label={`Actions for ${cycle.name}`}
      />
    </Dropdown>
  );
}

type AdmissionCycleStatusActionProps = {
  cycle: AdmissionCycleRow;
  onTransition: (cycle: AdmissionCycleRow, direction: TransitionDirection) => void;
};

export function AdmissionCycleStatusAction({
  cycle,
  onTransition,
}: AdmissionCycleStatusActionProps) {
  const forwardMeta =
    cycle.status !== "CLOSED"
      ? ADMISSION_CYCLE_TRANSITIONS[cycle.status]
      : null;

  return (
    <ConditionalRenderer when={forwardMeta !== null}>
      <PermissionGuard permission={Permission.AdmissionCyclesTransition}>
        <Button
          type="link"
          size="small"
          icon={<ArrowRightOutlined />}
          onClick={() => onTransition(cycle, "forward")}
          style={{ padding: 0, height: "auto" }}
        >
          {forwardMeta?.buttonLabel}
        </Button>
      </PermissionGuard>
    </ConditionalRenderer>
  );
}
