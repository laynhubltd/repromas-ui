import { BillingWorkflowDecisionGuard } from "@/features/billing/components/BillingWorkflowDecisionGuard";
import type { WorkflowPayNowPayload } from "@/features/billing/types/workflow-step-decision";
import { PaymentReturnAlert } from "@/features/student-payments/components/PaymentReturnAlert";
import type { usePaymentReturnPolling } from "@/features/student-payments/hooks/usePaymentReturnPolling";
import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  FileTextOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Alert, Button, Flex } from "antd";
import { Link } from "react-router-dom";
import { appPaths } from "@/app/routing/app-path";
import {
  ME_PROGRESS_UI_COPY,
  resolveBlockerMessage,
  type StatusDisplay,
} from "../constants/meAdmissionProgressOptions";
import type { MeAdmissionProgress } from "../types/me-admission-progress";
import type { ProgressPhaseGroup } from "../utils/admissionProgressDisplay";
import { AdmissionProgressHero } from "./AdmissionProgressHero";
import { AdmissionProgressSteps } from "./AdmissionProgressSteps";

type CandidateAdmissionProgressCardProps = {
  progress: MeAdmissionProgress;
  portalDisplay: StatusDisplay;
  primaryCtaLabel: string;
  phaseGroups: ProgressPhaseGroup[];
  progressPercent: number;
  activeStepNumber: number;
  totalSteps: number;
  paymentReturnPolling: ReturnType<typeof usePaymentReturnPolling>;
  showPrimaryCta: boolean;
  showFeeBanner: boolean;
  showDossierLink: boolean;
  isPayNowLoading: boolean;
  onPrimaryAction: () => void;
  onBillingPayNow: (payload: WorkflowPayNowPayload) => void | Promise<void>;
  onViewApplication: () => void;
};

export function CandidateAdmissionProgressCard({
  progress,
  portalDisplay,
  primaryCtaLabel,
  phaseGroups,
  progressPercent,
  activeStepNumber,
  totalSteps,
  paymentReturnPolling,
  showPrimaryCta,
  showFeeBanner,
  showDossierLink,
  isPayNowLoading,
  onPrimaryAction,
  onBillingPayNow,
  onViewApplication,
}: CandidateAdmissionProgressCardProps) {
  const token = useToken();
  const isMobile = useIsMobile();

  return (
    <Flex vertical gap={isMobile ? 16 : 20} style={{ width: "100%" }}>
      <PaymentReturnAlert polling={paymentReturnPolling} />

      <ConditionalRenderer when={progress.blockers.length > 0}>
        <Flex vertical gap={8} style={{ width: "100%" }}>
          {progress.blockers.map((blocker) => (
            <Alert
              key={`${blocker.code}-${blocker.step}`}
              type="warning"
              showIcon
              message="Action required"
              description={resolveBlockerMessage(blocker.code)}
            />
          ))}
        </Flex>
      </ConditionalRenderer>

      <AdmissionProgressHero
        portalDisplay={portalDisplay}
        cycleStatus={progress.cycleStatus}
        progressPercent={progressPercent}
        activeStepNumber={activeStepNumber}
        totalSteps={totalSteps}
        primaryCtaLabel={primaryCtaLabel}
        showPrimaryCta={showPrimaryCta}
        showFeeBanner={showFeeBanner}
        nextAction={progress.nextAction}
        onPrimaryAction={onPrimaryAction}
      />

      <ConditionalRenderer when={showFeeBanner}>
        <BillingWorkflowDecisionGuard
          workflowStep="SUBMIT_APPLICATION"
          eventCode="ADMISSION_APPLICATION_FEE"
          onPayNow={onBillingPayNow}
          isPayNowLoading={isPayNowLoading}
          showBanner
        >
          <span />
        </BillingWorkflowDecisionGuard>
      </ConditionalRenderer>

      <AdmissionProgressSteps phaseGroups={phaseGroups} />

      <ConditionalRenderer when={showDossierLink}>
        <Flex
          align="center"
          justify={isMobile ? "stretch" : "flex-end"}
          gap={token.marginSM}
          wrap="wrap"
          style={{ width: "100%" }}
        >
          <Link to={appPaths.StudentApply} style={{ flex: isMobile ? 1 : undefined }}>
            <Button block={isMobile} icon={<FormOutlined />}>
              {ME_PROGRESS_UI_COPY.openApplicationForm}
            </Button>
          </Link>
          <Link
            to={appPaths.StudentApplication}
            style={{ flex: isMobile ? 1 : undefined }}
          >
            <Button
              type={showPrimaryCta ? "default" : "primary"}
              block={isMobile}
              icon={<FileTextOutlined />}
              onClick={onViewApplication}
            >
              {ME_PROGRESS_UI_COPY.viewFullApplication}
            </Button>
          </Link>
        </Flex>
      </ConditionalRenderer>
    </Flex>
  );
}
