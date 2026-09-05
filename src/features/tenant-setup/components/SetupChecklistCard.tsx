import { StepCard } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import {
  ApartmentOutlined,
  BookOutlined,
  DollarOutlined,
  FileTextOutlined,
  FormOutlined,
  RadiusSettingOutlined,
  SettingOutlined,
  SolutionOutlined,
  TrophyOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { Button, Flex, Progress, Space, Typography } from "antd";
import type { ReactNode } from "react";
import { useSetupChecklist } from "../hooks/useSetupChecklist";
import type { SetupStepId } from "../types/setup";

const STEP_ICONS: Record<SetupStepId, ReactNode> = {
  signedIn: <UserOutlined />,
  department: <ApartmentOutlined />,
  level: <SettingOutlined />,
  program: <RadiusSettingOutlined />,
  curriculumVersion: <BookOutlined />,
  course: <BookOutlined />,
  staff: <UserOutlined />,
  transitionStatusDefault: <RadiusSettingOutlined />,
  student: <UsergroupAddOutlined />,
  admissionConfig: <SettingOutlined />,
  admissionCandidate: <SolutionOutlined />,
  courseRegistration: <FormOutlined />,
  assessment: <FileTextOutlined />,
  gradingConfig: <TrophyOutlined />,
  billing: <DollarOutlined />,
  settings: <SettingOutlined />,
  systemConfig: <SettingOutlined />
};

export function SetupChecklistCard() {
  const token = useToken();
  const { state, actions, flags } = useSetupChecklist();

  return (
    <DataLoader loading={state.isLoading} minHeight="200px">
      <Space direction="vertical" size={token.marginLG} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            {state.title}
          </Typography.Title>
          <Typography.Text type="secondary">{state.subtitle}</Typography.Text>
        </div>

        <div>
          <Flex justify="space-between" align="center" style={{ marginBottom: 8 }}>
            <Typography.Text type="secondary">
              {state.progressPercent}% complete
            </Typography.Text>
            <Typography.Text type="secondary">
              Next: {state.currentStepLabel}
            </Typography.Text>
          </Flex>
          <Progress percent={state.progressPercent} showInfo={false} />
        </div>

        <Flex
          gap={token.marginLG}
          wrap="wrap"
          justify="center"
          style={{ width: "100%" }}
        >
          {state.checklistSteps.map((step) => (
            <StepCard
              key={step.id}
              stepNumber={step.stepNumber}
              icon={STEP_ICONS[step.id]}
              title={step.title}
              description={step.description}
              done={step.done}
              active={step.active}
            />
          ))}
        </Flex>

        <ConditionalRenderer when={flags.showSetupChecklist}>
          <Button type="primary" size="large" onClick={actions.handleContinueSetup}>
            {state.ctaLabel}
          </Button>
        </ConditionalRenderer>
      </Space>
    </DataLoader>
  );
}
