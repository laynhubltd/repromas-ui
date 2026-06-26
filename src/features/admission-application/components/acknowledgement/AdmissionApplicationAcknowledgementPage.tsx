import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Button, Flex, Typography } from "antd";
import { ACKNOWLEDGEMENT_SLIP_UI_COPY } from "../../constants/acknowledgementSlipOptions";
import { useAdmissionApplicationAcknowledgementPage } from "../../hooks/useAdmissionApplicationAcknowledgementPage";
import { AcknowledgementConfirmationBanner } from "./AcknowledgementConfirmationBanner";
import { AcknowledgementSlip } from "./AcknowledgementSlip";

const { Title } = Typography;

export function AdmissionApplicationAcknowledgementPage() {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useAdmissionApplicationAcknowledgementPage();

  const pageShellStyle = {
    width: "100%",
    maxWidth: isMobile ? "100%" : 920,
    margin: "0 auto",
    minWidth: 0,
  } as const;

  if (!flags.isCandidate) {
    return (
      <Flex vertical gap={16} style={pageShellStyle}>
        <Title level={3}>{state.pageTitle}</Title>
        <Typography.Text type="secondary">
          This page is available to admission candidates only.
        </Typography.Text>
      </Flex>
    );
  }

  return (
    <Flex vertical gap={isMobile ? 16 : 24} style={pageShellStyle}>
      <Title level={isMobile ? 3 : 2} style={{ marginBottom: 0 }}>
        {state.pageTitle}
      </Title>

      <ConditionalRenderer when={flags.justSubmitted}>
        <AcknowledgementConfirmationBanner />
      </ConditionalRenderer>

      <DataLoader
        loading={state.isLoading}
        loader={<SkeletonRows count={3} variant="card" />}
      >
        <ConditionalRenderer when={!!state.sectionError && !flags.notStarted}>
          <ErrorAlert
            variant="section"
            error={state.sectionError}
            onRetry={actions.refetch}
          />
        </ConditionalRenderer>

        <ConditionalRenderer when={flags.canShowSlip && state.acknowledgementSlipModel != null}>
          <AcknowledgementSlip
            model={state.acknowledgementSlipModel!}
            contentRef={state.slipContentRef}
            showToolbar
            onPrint={actions.handlePrint}
          />
        </ConditionalRenderer>

        <Flex
          justify="flex-end"
          gap={8}
          wrap="wrap"
          style={{ marginTop: token.marginMD }}
        >
          <Button onClick={actions.handleViewApplication} block={isMobile}>
            {ACKNOWLEDGEMENT_SLIP_UI_COPY.viewApplication}
          </Button>
          <Button onClick={actions.handleBackToHome} block={isMobile}>
            {ACKNOWLEDGEMENT_SLIP_UI_COPY.backToHome}
          </Button>
        </Flex>
      </DataLoader>
    </Flex>
  );
}
