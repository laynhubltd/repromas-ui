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
import { Alert, Button, Card, Flex, Progress, Steps, Typography } from "antd";
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
    stateOptions,
    lgaOptions,
    isLgasLoading,
    isLoading,
    isPatching,
    isPersistingBeforePay,
    noAssignment,
    isLastStep,
    layout,
    versionMismatchMessage,
    noAssignmentMessage,
  } = state;

  const isMobile = layout.isMobile;

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
    status: (
      i < wizardState.currentStep
        ? "finish"
        : i === wizardState.currentStep
          ? "process"
          : "wait"
    ) as "finish" | "process" | "wait",
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
    <div style={{ margin: "0 auto", width: "100%" }}>
      {/* Page header */}
      <Typography.Title
        level={isMobile ? 4 : 3}
        style={{ marginBottom: 4 }}
      >
        {renderPackage?.form.name ?? "Admission Application"}
      </Typography.Title>
      {renderPackage?.form && (
        <Typography.Paragraph
          type="secondary"
          style={{ marginBottom: isMobile ? 16 : 24 }}
        >
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
            {/* ── Mobile: compact progress bar on top ───────────────── */}
            {isMobile && (
              <div style={{ marginBottom: 16 }}>
                <Typography.Text
                  strong
                  style={{ display: "block", marginBottom: 6, fontSize: token.fontSizeSM }}
                >
                  {compactStepLabel}
                </Typography.Text>
                <Progress
                  percent={stepProgress}
                  showInfo={false}
                  strokeColor={token.colorPrimary}
                />
              </div>
            )}

            {/* ── Main layout: sidebar + content ────────────────────── */}
            <div
              style={
                isMobile
                  ? { display: "flex", flexDirection: "column", gap: 16 }
                  : {
                      display: "grid",
                      gridTemplateColumns: "25% 1fr",
                      gap: 24,
                      alignItems: "start",
                    }
              }
            >
              {/* Steps sidebar — desktop only */}
              {!isMobile && (
                <Card
                  size="small"
                  style={{
                    position: "sticky",
                    top: 24,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: token.borderRadius,
                    background: token.colorBgContainer,
                  }}
                  styles={{ body: { padding: "16px 12px" } }}
                >
                  <Steps
                    current={wizardState.currentStep}
                    items={stepItems}
                    size="small"
                    direction="vertical"
                    style={{ margin: 0 }}
                  />
                </Card>
              )}

              {/* Section content */}
              <Card
                size="small"
                title={currentSection?.title}
                style={{
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgContainer,
                }}
                styles={{
                  header: currentSection
                    ? { padding: isMobile ? "12px 16px" : "16px 24px" }
                    : undefined,
                  body: { padding: isMobile ? 16 : 24 },
                }}
              >
                {currentSection && (
                  <DynamicFormSectionView
                    section={currentSection}
                    values={currentValues}
                    onFieldChange={actions.handleFieldChange}
                    fieldErrors={wizardState.fieldErrors}
                    programOptions={programOptions}
                    stateOptions={stateOptions}
                    lgaOptions={lgaOptions}
                    isLgasLoading={isLgasLoading}
                    subjectOptions={subjectOptions}
                    candidateId={candidate?.id}
                    actorType="CANDIDATE"
                  />
                )}

                {wizardState.lastSavedAt && (
                  <Alert
                    type="info"
                    message={`Draft saved at ${new Date(wizardState.lastSavedAt).toLocaleTimeString()}`}
                    style={{ marginBottom: 16, marginTop: 8 }}
                    showIcon
                  />
                )}

                {/* Navigation buttons */}
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
                          marginInline: isMobile ? -16 : -24,
                          paddingInline: isMobile ? 16 : 24,
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
                        showBanner
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
              </Card>
            </div>
          </>
        )}
      </DataLoader>
    </div>
  );
}
