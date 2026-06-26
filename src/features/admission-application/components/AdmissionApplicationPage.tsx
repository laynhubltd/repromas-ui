import { ExplainerCallout } from "@/components/ui-kit";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Button, Card, Flex, Typography } from "antd";
import { ME_APPLICATION_UI_COPY } from "../constants/meAdmissionApplicationOptions";
import { useAdmissionApplicationPage } from "../hooks/useAdmissionApplicationPage";
import { AdmissionApplicationDossierView } from "./AdmissionApplicationDossierView";

const { Title, Paragraph } = Typography;

export function AdmissionApplicationPage() {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useAdmissionApplicationPage();
  const { application } = state;

  const pageShellStyle = {
    width: "100%",
    maxWidth: isMobile ? "100%" : 920,
    margin: "0 auto",
    minWidth: 0,
  } as const;

  if (!flags.isCandidate) {
    return (
      <Card style={pageShellStyle}>
        <Title level={3}>{ME_APPLICATION_UI_COPY.pageTitle}</Title>
        <Paragraph type="secondary">
          This page is available to admission candidates only.
        </Paragraph>
      </Card>
    );
  }

  return (
    <Flex vertical gap={isMobile ? 16 : 24} style={pageShellStyle}>
      <Title level={isMobile ? 3 : 2} style={{ marginBottom: 0 }}>
        {ME_APPLICATION_UI_COPY.pageTitle}
      </Title>

      <ExplainerCallout
        intent="info"
        collapsible
        title={ME_APPLICATION_UI_COPY.explorerTitle}
        body={ME_APPLICATION_UI_COPY.explorerBody}
      />

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={4} variant="card" />}
      >
        <ConditionalRenderer
          when={flags.notStarted}
          wrapper={centeredBox({
            border: `1px dashed ${token.colorBorder}`,
            borderRadius: token.borderRadius,
            background: token.colorBgContainer,
          })}
        >
          <Typography.Title level={4} style={{ marginTop: 0 }}>
            {ME_APPLICATION_UI_COPY.notStartedTitle}
          </Typography.Title>
          <Typography.Paragraph type="secondary">
            {ME_APPLICATION_UI_COPY.notStartedBody}
          </Typography.Paragraph>
          <Button type="primary" onClick={actions.handleStartApplication}>
            {ME_APPLICATION_UI_COPY.startApplication}
          </Button>
        </ConditionalRenderer>

        <ConditionalRenderer when={!!state.sectionError && !flags.notStarted}>
          <ErrorAlert
            variant="section"
            error={state.sectionError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        {application ? (
          <AdmissionApplicationDossierView
            application={application}
            lifecycle={state.lifecycle}
            jambScoreRows={state.jambScoreRows}
            candidateId={application.candidate?.id}
            acknowledgementSlipModel={state.acknowledgementSlipModel}
            printableApplicationModel={state.printableApplicationModel}
            slipContentRef={state.slipContentRef}
            applicationContentRef={state.applicationContentRef}
            flags={{
              showContinueApply: flags.showContinueApply,
              showViewPayments: flags.showViewPayments,
              showFeeBanner: flags.showFeeBanner,
              showDocumentActions: flags.showDocumentActions,
              showOfferCard: flags.showOfferCard,
              showScreeningSection: flags.showScreeningSection,
              showScreeningPending: flags.showScreeningPending,
              showJambSection: flags.showJambSection,
              showCandidateMetadata: flags.showCandidateMetadata,
            }}
            isPayNowLoading={state.isPayNowLoading}
            onContinueApply={actions.handleContinueApply}
            onViewPayments={actions.handleViewPayments}
            onBillingPayNow={actions.handleBillingPayNow}
            onPrintAcknowledgementSlip={actions.handlePrintAcknowledgementSlip}
            onPrintApplication={actions.handlePrintApplication}
          />
        ) : null}
      </DataLoader>
    </Flex>
  );
}
