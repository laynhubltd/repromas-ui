import { SETUP_CHECKLIST_LAUNCHER_LABEL } from "@/shared/constants/setupChecklistOptions";
import { UnorderedListOutlined } from "@ant-design/icons";
import { Badge, FloatButton } from "antd";
import { useSetupChecklist } from "../hooks/useSetupChecklist";
import { useSetupUi } from "../hooks/useSetupUi";
import { SetupChecklistPanel } from "./SetupChecklistPanel";

export function SetupChecklistLauncher() {
  const { state } = useSetupChecklist();
  const { state: uiState, actions, flags } = useSetupUi();

  if (!flags.showLauncher) {
    return null;
  }

  return (
    <>
      <Badge count={state.remainingStepCount} size="small">
        <FloatButton
          type="primary"
          icon={<UnorderedListOutlined />}
          tooltip={SETUP_CHECKLIST_LAUNCHER_LABEL}
          onClick={actions.openPanel}
        />
      </Badge>
      <SetupChecklistPanel
        open={uiState.isPanelOpen}
        onClose={actions.closePanel}
        onDismiss={actions.dismissPanel}
      />
    </>
  );
}
