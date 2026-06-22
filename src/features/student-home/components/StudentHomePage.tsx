import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { Card, Flex, Typography } from "antd";
import { ME_PROGRESS_UI_COPY } from "../constants/meAdmissionProgressOptions";
import { useStudentHomePage } from "../hooks/useStudentHomePage";
import { CandidateAdmissionProgressCard } from "./CandidateAdmissionProgressCard";

const { Paragraph, Title } = Typography;

export default function StudentHomePage() {
  const token = useToken();
  const isMobile = useIsMobile();
  const { state, actions, flags } = useStudentHomePage();

  const pageShellStyle = {
    width: "100%",
    maxWidth: isMobile ? "100%" : 920,
    margin: "0 auto",
    minWidth: 0,
  } as const;

  return (
    <Flex vertical gap={isMobile ? 16 : 24} style={pageShellStyle}>
      <ConditionalRenderer when={flags.showCandidateHome}>
        <Flex vertical gap={4}>
          <Title level={isMobile ? 3 : 2} style={{ marginBottom: 0 }}>
            {ME_PROGRESS_UI_COPY.dashboardTitle}
          </Title>
          <Paragraph type="secondary" style={{ marginBottom: 0 }}>
            {ME_PROGRESS_UI_COPY.dashboardSubtitle}
          </Paragraph>
        </Flex>
      </ConditionalRenderer>

      <ConditionalRenderer when={!flags.showCandidateHome}>
        <Title level={isMobile ? 3 : 2} style={{ marginBottom: 0 }}>
          Student Portal
        </Title>
      </ConditionalRenderer>

      <ConditionalRenderer when={flags.showScopeLoading}>
        <DataLoader loading loader={<SkeletonRows count={2} variant="card" />}>
          <span />
        </DataLoader>
      </ConditionalRenderer>

      <ConditionalRenderer when={flags.showStudentWelcome}>
        <Card>
          <Flex vertical gap={10} style={{ width: "100%" }}>
            <Title level={3} style={{ marginBottom: 0 }}>
              Welcome
            </Title>
            <Paragraph style={{ marginBottom: 0 }}>
              Welcome to the student module. Use the menu to register courses,
              view invoices, and manage your academic records.
            </Paragraph>
          </Flex>
        </Card>
      </ConditionalRenderer>

      <ConditionalRenderer when={flags.showCandidateHome}>
        <DataLoader
          loading={state.isLoading && flags.showCandidateProgress}
          loader={<SkeletonRows count={4} variant="card" />}
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
              Admission profile not linked
            </Title>
            <Paragraph type="secondary">
              {ME_PROGRESS_UI_COPY.noCandidateLinked}
            </Paragraph>
          </ConditionalRenderer>

          <ConditionalRenderer when={flags.showCandidateProgress}>
            <ConditionalRenderer when={!!state.sectionError}>
              <ErrorAlert
                variant="section"
                error={state.sectionError}
                onRetry={actions.refetch}
              />
            </ConditionalRenderer>

            {state.progress ? (
              <CandidateAdmissionProgressCard
                progress={state.progress}
                portalDisplay={state.portalDisplay}
                primaryCtaLabel={state.primaryCtaLabel}
                phaseGroups={state.phaseGroups}
                progressPercent={state.progressPercent}
                activeStepNumber={state.activeStepNumber}
                totalSteps={state.totalSteps}
                paymentReturnPolling={state.paymentReturnPolling}
                showPrimaryCta={flags.showPrimaryCta}
                showFeeBanner={flags.showFeeBanner}
                showDossierLink={flags.showDossierLink}
                isPayNowLoading={state.isPayNowLoading}
                onPrimaryAction={actions.handlePrimaryAction}
                onBillingPayNow={actions.handleBillingPayNow}
                onViewApplication={actions.handleViewApplication}
              />
            ) : null}
          </ConditionalRenderer>
        </DataLoader>
      </ConditionalRenderer>
    </Flex>
  );
}
