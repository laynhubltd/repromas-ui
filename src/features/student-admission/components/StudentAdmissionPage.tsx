import { ExplainerCallout } from "@/components/ui-kit";
import { BillingWorkflowDecisionGuard } from "@/features/billing";
import { PaymentReturnAlert } from "@/features/student-payments/components/PaymentReturnAlert";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Card, Flex, Tag, Typography } from "antd";
import {
  ADMISSION_ACCEPTANCE_FEE_EVENT_CODE,
  ADMISSION_LETTER_WORKFLOW_STEP,
  STUDENT_ADMISSION_UI_COPY,
} from "../constants/studentAdmissionOptions";
import { useStudentAdmissionPage } from "../hooks/useStudentAdmissionPage";
import { AdmissionLetter } from "@/features/reporting/components/AdmissionLetter";

const { Title, Paragraph } = Typography;

export function StudentAdmissionPage() {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useStudentAdmissionPage();

  const pageShellStyle = {
    width: "100%",
    maxWidth: isMobile ? "100%" : 920,
    margin: "0 auto",
    minWidth: 0,
  } as const;

  if (!flags.isCandidate) {
    return (
      <Card style={pageShellStyle}>
        <Title level={3}>{STUDENT_ADMISSION_UI_COPY.pageTitle}</Title>
        <Paragraph type="secondary">
          {STUDENT_ADMISSION_UI_COPY.notCandidateMessage}
        </Paragraph>
      </Card>
    );
  }

  return (
    <Flex vertical gap={isMobile ? 16 : 24} style={pageShellStyle}>
      <Title level={isMobile ? 3 : 2} style={{ marginBottom: 0 }}>
        {STUDENT_ADMISSION_UI_COPY.pageTitle}
      </Title>

      <ConditionalRenderer when={!flags.showLetter}>
        <ExplainerCallout
          intent="info"
          collapsible
          title={STUDENT_ADMISSION_UI_COPY.explorerTitle}
          body={STUDENT_ADMISSION_UI_COPY.explorerBody}
        />
      </ConditionalRenderer>



      <ConditionalRenderer when={flags.isCandidate}>
        <PaymentReturnAlert polling={state.paymentReturnPolling} />
      </ConditionalRenderer>

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={3} variant="card" />}
      >
        <ConditionalRenderer
          when={flags.noCandidateLinked}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Title level={4} style={{ marginTop: 0 }}>
            {STUDENT_ADMISSION_UI_COPY.noCandidateLinkedTitle}
          </Title>
          <Paragraph type="secondary">
            {STUDENT_ADMISSION_UI_COPY.noCandidateLinkedBody}
          </Paragraph>
        </ConditionalRenderer>

        <ConditionalRenderer when={!!state.sectionError}>
          <ErrorAlert
            variant="section"
            error={state.sectionError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer
          when={flags.showNotAdmittedState}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Flex vertical gap={token.marginSM} align="center">
            <Tag color={state.portalDisplay.color}>{state.portalDisplay.label}</Tag>
            <Title level={4} style={{ marginTop: 0, marginBottom: 0 }}>
              {STUDENT_ADMISSION_UI_COPY.notAdmittedTitle}
            </Title>
            <Paragraph type="secondary" style={{ marginBottom: 0, textAlign: "center" }}>
              {STUDENT_ADMISSION_UI_COPY.notAdmittedBody}
            </Paragraph>
          </Flex>
        </ConditionalRenderer>

        {flags.showLetter && flags.applyAcceptanceFeeGuard ? (
          <BillingWorkflowDecisionGuard
            workflowStep={ADMISSION_LETTER_WORKFLOW_STEP}
            eventCode={ADMISSION_ACCEPTANCE_FEE_EVENT_CODE}
            skip={!flags.applyAcceptanceFeeGuard}
            onPayNow={actions.handleBillingPayNow}
            isPayNowLoading={state.isPayNowLoading}
            showBanner
          >
            <div style={{ width: "100%" }}>
              <AdmissionLetter />
            </div>
          </BillingWorkflowDecisionGuard>
        ) : null}

        {flags.showLetter && !flags.applyAcceptanceFeeGuard ? (
          <AdmissionLetter />
        ) : null}
      </DataLoader>
    </Flex>
  );
}
