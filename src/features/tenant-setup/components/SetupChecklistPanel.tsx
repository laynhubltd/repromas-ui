import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { CheckCircleOutlined } from "@ant-design/icons";
import { Button, Drawer, Flex, List, Progress, Typography } from "antd";
import { SETUP_CHECKLIST_LAUNCHER_LABEL } from "@/shared/constants/setupChecklistOptions";
import { useSetupChecklist } from "../hooks/useSetupChecklist";

type SetupChecklistPanelProps = {
  open: boolean;
  onClose: () => void;
  onDismiss: () => void;
};

export function SetupChecklistPanel({
  open,
  onClose,
  onDismiss,
}: SetupChecklistPanelProps) {
  const token = useToken();
  const { state, actions } = useSetupChecklist();

  return (
    <Drawer
      title={SETUP_CHECKLIST_LAUNCHER_LABEL}
      placement="right"
      open={open}
      onClose={onClose}
      size={360}
    >
      <DataLoader loading={state.isLoading} minHeight="120px">
        <Flex vertical gap={token.marginMD}>
          <Typography.Text type="secondary">{state.subtitle}</Typography.Text>
          <Progress percent={state.progressPercent} />
          <List
            dataSource={state.checklistSteps}
            renderItem={(step) => (
              <List.Item
                style={{
                  cursor: step.done || step.active ? "pointer" : "default",
                  opacity: step.done || step.active ? 1 : 0.6,
                }}
                onClick={() => {
                  if (step.done || step.active) {
                    actions.handleGoToStep(step.id);
                    onClose();
                  }
                }}
              >
                <List.Item.Meta
                  avatar={
                    step.done ? (
                      <CheckCircleOutlined style={{ color: token.colorSuccess }} />
                    ) : (
                      <Typography.Text strong>{step.stepNumber}</Typography.Text>
                    )
                  }
                  title={step.title}
                  description={step.description}
                />
              </List.Item>
            )}
          />
          <Button type="primary" block onClick={actions.handleContinueSetup}>
            {state.ctaLabel}
          </Button>
          <Button type="link" block onClick={onDismiss}>
            Dismiss for now
          </Button>
        </Flex>
      </DataLoader>
    </Drawer>
  );
}
