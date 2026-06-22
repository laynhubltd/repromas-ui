import { ExplainerCallout } from "@/components/ui-kit";
import { BillingWorkflowDecisionGuard } from "@/features/billing";
import { DynamicFormSectionView } from "@/features/dynamic-form/components/field-renderers/DynamicFormSectionView";
import {
  buildCompactStepLabel,
  resolveStepProgressPercent,
} from "@/features/dynamic-form/utils/dynamicFormLayout";
import { useToken } from "@/shared/hooks/useToken";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  ArrowLeftOutlined,
  ArrowRightOutlined,
  SendOutlined,
} from "@ant-design/icons";
import { Alert, Button, Flex, Progress, Steps, Typography } from "antd";
import { useAdmissionApplicationWizard } from "../hooks/useAdmissionApplicationWizard";

export function AdmissionApplicationWizard() {
  const token = useToken();
  const { state, actions } = useAdmissionApplicationWizard();
  const {
    candidate,
    renderPackage,
    currentSection,
    currentValues,
    wizardState,
    programOptions,
    subjectOptions,
    isLoading,
    isPatching,
    isPersistingBeforePay,
    noAssignment,
    isLastStep,
    layout,
    versionMismatchMessage,
    noAssignmentMessage,
  } = state;

  if (noAssignment) {
    return (
      <ExplainerCallout
        intent="warning"
        title="Application form unavailable"
        body={noAssignmentMessage}
      />
    );
  }

  const stepItems = wizardState.sortedSections.map((s, i) => ({
    title: s.title,
    status: (i < wizardState.currentStep
      ? "finish"
      : i === wizardState.currentStep
        ? "process"
        : "wait") as "finish" | "process" | "wait",
  }));

  const compactStepLabel = buildCompactStepLabel(
    wizardState.sortedSections,
    wizardState.currentStep,
  );
  const stepProgress = resolveStepProgressPercent(
    wizardState.sortedSections,
    wizardState.currentStep,
  );

  const navButtonStyle = { minHeight: 44 };

  return (
    <div style={{ margin: "0 auto", width: "100%", maxWidth: 960 }}>
      <Typography.Title
        level={layout.isMobile ? 4 : 3}
        style={{ marginBottom: 8 }}
      >
        {renderPackage?.form.name ?? "Admission Application"}
      </Typography.Title>
      {renderPackage?.form && (
        <Typography.Paragraph type="secondary" style={{ marginBottom: 24 }}>
          Version {renderPackage.form.version}
        </Typography.Paragraph>
      )}

      {wizardState.versionMismatch && (
        <ErrorAlert
          variant="section"
          error={versionMismatchMessage}
          action={
            <Button size="small" onClick={actions.handleReloadPackage}>
              Reload form
            </Button>
          }
        />
      )}

      <DataLoader
        loading={isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        {wizardState.sortedSections.length > 0 && (
          <>
            {layout.stepsVariant === "compact" ? (
              <div style={{ marginBottom: 24 }}>
                <Typography.Text
                  strong
                  style={{ display: "block", marginBottom: 8 }}
                >
                  {compactStepLabel}
                </Typography.Text>
                <Progress percent={stepProgress} showInfo={false} />
              </div>
            ) : (
              <Steps
                current={wizardState.currentStep}
                items={stepItems}
                size="small"
                style={{ marginBottom: 32 }}
              />
            )}

            {currentSection && (
              <>
                <Typography.Title
                  level={layout.isMobile ? 5 : 4}
                  style={{ marginBottom: 16 }}
                >
                  {currentSection.title}
                </Typography.Title>
                <DynamicFormSectionView
                  section={currentSection}
                  values={currentValues}
                  onFieldChange={actions.handleFieldChange}
                  fieldErrors={wizardState.fieldErrors}
                  programOptions={programOptions}
                  subjectOptions={subjectOptions}
                  candidateId={candidate?.id}
                  actorType="CANDIDATE"
                />
              </>
            )}

            {wizardState.lastSavedAt && (
              <Alert
                type="info"
                message={`Draft saved at ${new Date(wizardState.lastSavedAt).toLocaleTimeString()}`}
                style={{ marginBottom: 16 }}
                showIcon
              />
            )}

            <div
              style={
                layout.stickyNav
                  ? {
                      position: "sticky",
                      bottom: 0,
                      zIndex: 1,
                      background: token.colorBgContainer,
                      paddingTop: 12,
                      paddingBottom: 8,
                      borderTop: `1px solid ${token.colorBorderSecondary}`,
                      marginTop: 24,
                    }
                  : { marginTop: 24 }
              }
            >
              <Flex
                vertical={layout.navButtonsBlock}
                justify="space-between"
                gap={12}
              >
                <Button
                  icon={<ArrowLeftOutlined />}
                  onClick={actions.handleBack}
                  disabled={wizardState.currentStep === 0}
                  block={layout.navButtonsBlock}
                  style={navButtonStyle}
                >
                  Back
                </Button>
                {isLastStep ? (
                  <BillingWorkflowDecisionGuard
                    workflowStep="SUBMIT_APPLICATION"
                    onPayNow={actions.handleBillingPayNow}
                    isPayNowLoading={isPatching || isPersistingBeforePay}
                    showBanner={true}
                  >
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      loading={wizardState.submitting}
                      onClick={actions.handleSubmit}
                      block={layout.navButtonsBlock}
                      style={navButtonStyle}
                    >
                      Submit application
                    </Button>
                  </BillingWorkflowDecisionGuard>
                ) : (
                  <Button
                    type="primary"
                    icon={<ArrowRightOutlined />}
                    loading={isPatching}
                    onClick={actions.handleNext}
                    block={layout.navButtonsBlock}
                    style={navButtonStyle}
                  >
                    Next
                  </Button>
                )}
              </Flex>
            </div>
          </>
        )}
      </DataLoader>
    </div>
  );
}
