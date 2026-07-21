import { EditOutlined, EyeOutlined } from "@ant-design/icons";
import { useCallback, useMemo, useState } from "react";
import type { useSignatoriesConfig } from "../hooks/useSignatoriesConfig";
import type { ConfigItemAction } from "../types/config-item";
import { ConfigItem } from "./ConfigItem";
import { SignatoriesConfigDrawer } from "./drawers/SignatoriesConfigDrawer";
import { SignatoriesConfigModal } from "./modals/SignatoriesConfigModal";

type SignatoriesConfigProps = ReturnType<typeof useSignatoriesConfig>;

function useSignatoriesConfigItem({
  state,
  actions,
  flags,
}: SignatoriesConfigProps) {
  const [viewOpen, setViewOpen] = useState(false);

  const handleOpenView = useCallback(() => {
    setViewOpen(true);
  }, []);

  const handleCloseView = useCallback(() => {
    setViewOpen(false);
  }, []);

  const summaryLabel = flags.hasSignatories
    ? `${state.localList.length} signator${state.localList.length === 1 ? "y" : "ies"} configured`
    : null;

  const menuItems = useMemo<ConfigItemAction[]>(
    () => [
      {
        key: "manage",
        label: "Manage",
        icon: <EditOutlined />,
        onClick: handleOpenView,
      },
      {
        key: "view",
        label: "View",
        icon: <EyeOutlined />,
        onClick: handleOpenView,
      },
    ],
    [handleOpenView],
  );

  return {
    state: {
      summaryLabel,
      viewOpen,
    },
    actions: {
      handleOpenView,
      handleCloseView,
    },
    flags: {
      isNotConfigured: flags.isNotConfigured,
    },
    menuItems,
    controller: {
      state,
      actions,
      flags,
    },
  };
}

const SignatoriesConfig = (props: SignatoriesConfigProps) => {
  const { state, actions, flags, menuItems, controller } =
    useSignatoriesConfigItem(props);

  return (
    <>
      <ConfigItem
        type="JSON_OBJECT"
        label="Signatories"
        summary={state.summaryLabel}
        isNotConfigured={flags.isNotConfigured}
        actions={menuItems}
      />

      {/* Drawer is the main management surface — list + add/remove + save */}
      <SignatoriesConfigDrawer
        open={state.viewOpen}
        onClose={actions.handleCloseView}
        state={controller.state}
        actions={controller.actions}
        flags={controller.flags}
      />

      {/* Add/Edit modal — rendered inside the drawer's portal */}
      <SignatoriesConfigModal
        open={controller.state.modalOpen}
        onClose={controller.actions.handleCloseModal}
        state={controller.state}
        actions={controller.actions}
        flags={controller.flags}
      />
    </>
  );
};

export default SignatoriesConfig;
