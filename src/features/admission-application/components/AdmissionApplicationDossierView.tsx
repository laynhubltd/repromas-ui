import { DashCard } from "@/components/ui-kit";
import { BillingWorkflowDecisionGuard } from "@/features/billing";
import type { WorkflowPayNowPayload } from "@/features/billing/types/workflow-step-decision";
import { FEE_EVENT_CODE } from "@/shared/constants/feeEventOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { MetadataRenderer } from "@/shared/ui/MetadataRenderer";
import { Button, Card, Descriptions, Flex, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import {
  ME_APPLICATION_UI_COPY,
  resolveApplicationStatusDisplay,
  resolveFinalDecisionDisplay,
} from "../constants/meAdmissionApplicationOptions";
import type {
  MeAdmissionApplication,
  MeAdmissionJambScore,
} from "../types/me-admission-application";
import type { DerivedLifecycleState } from "../utils/applicationDossierDisplay";
import {
  formatApplicationDate,
  resolveRelatedName,
} from "../utils/applicationDossierDisplay";
import { resolveJambSubjectName } from "../utils/meApplicationJambDisplay";
import { ApplicationLifecycleSteps } from "./ApplicationLifecycleSteps";
import { ApplicationOlevelSection } from "./ApplicationOlevelSection";
import { ApplicationStatusHero } from "./ApplicationStatusHero";
import { ApplicationDocumentsSection } from "./ApplicationDocumentsSection";
import { AcknowledgementSlip } from "./acknowledgement/AcknowledgementSlip";
import { ApplicationDocumentActions } from "./print/ApplicationDocumentActions";
import { PrintableApplicationDossier } from "./print/PrintableApplicationDossier";
import type {
  AcknowledgementSlipModel,
  PrintableApplicationDocumentModel,
} from "../types/acknowledgement-slip";
import type { RefObject } from "react";

type AdmissionApplicationDossierViewProps = {
  application: MeAdmissionApplication;
  lifecycle: DerivedLifecycleState | null;
  jambScoreRows: MeAdmissionJambScore[];
  candidateId: number | undefined;
  flags: {
    showContinueApply: boolean;
    showViewPayments: boolean;
    showFeeBanner: boolean;
    showDocumentActions: boolean;
    showOfferCard: boolean;
    showScreeningSection: boolean;
    showScreeningPending: boolean;
    showJambSection: boolean;
    showCandidateMetadata: boolean;
  };
  acknowledgementSlipModel: AcknowledgementSlipModel | null;
  printableApplicationModel: PrintableApplicationDocumentModel | null;
  slipContentRef: RefObject<HTMLDivElement | null>;
  applicationContentRef: RefObject<HTMLDivElement | null>;
  isPayNowLoading: boolean;
  onContinueApply: () => void;
  onViewPayments: () => void;
  onBillingPayNow: (payload: WorkflowPayNowPayload) => void | Promise<void>;
  onPrintAcknowledgementSlip: () => void;
  onPrintApplication: () => void;
};

export function AdmissionApplicationDossierView({
  application,
  lifecycle,
  jambScoreRows,
  candidateId,
  flags,
  acknowledgementSlipModel,
  printableApplicationModel,
  slipContentRef,
  applicationContentRef,
  isPayNowLoading,
  onContinueApply,
  onViewPayments,
  onBillingPayNow,
  onPrintAcknowledgementSlip,
  onPrintApplication,
}: AdmissionApplicationDossierViewProps) {
  const jambScoreColumns: ColumnsType<MeAdmissionJambScore> = useMemo(
    () => [
      {
        title: "Subject",
        key: "subject",
        render: (_: unknown, record) => resolveJambSubjectName(record),
      },
      {
        title: "Score",
        dataIndex: "score",
        key: "score",
        width: 100,
        align: "right",
      },
    ],
    [],
  );

  return (
    <>
      <ConditionalRenderer when={flags.showDocumentActions}>
        <ApplicationDocumentActions
          onPrintAcknowledgementSlip={onPrintAcknowledgementSlip}
          onPrintApplication={onPrintApplication}
        />
      </ConditionalRenderer>

      <Flex justify="flex-end" gap={8} wrap="wrap">
        <ConditionalRenderer when={flags.showContinueApply}>
          <Button type="primary" onClick={onContinueApply}>
            {ME_APPLICATION_UI_COPY.continueApplication}
          </Button>
        </ConditionalRenderer>
        <ConditionalRenderer when={flags.showViewPayments}>
          <Button onClick={onViewPayments}>
            {ME_APPLICATION_UI_COPY.viewPayments}
          </Button>
        </ConditionalRenderer>
      </Flex>

      <ConditionalRenderer when={flags.showFeeBanner}>
        <BillingWorkflowDecisionGuard
          workflowStep="SUBMIT_APPLICATION"
          eventCode={FEE_EVENT_CODE.ADMISSION_APPLICATION}
          skip={!flags.showFeeBanner}
          onPayNow={onBillingPayNow}
          isPayNowLoading={isPayNowLoading}
          showBanner
        >
          <span />
        </BillingWorkflowDecisionGuard>
      </ConditionalRenderer>

      <DashCard
        title="Application status"
        value={
          resolveApplicationStatusDisplay(application.applicationStatus).label
        }
        state="default"
        size="md"
        density="comfortable"
      />

      <ApplicationStatusHero
        applicationStatus={resolveApplicationStatusDisplay(
          application.applicationStatus,
        )}
        finalDecision={resolveFinalDecisionDisplay(application.finalDecision)}
        cycleName={application.candidate?.cycle?.name}
        appliedProgramName={application.appliedProgram?.name}
        lastUpdated={`${ME_APPLICATION_UI_COPY.lastUpdated}: ${formatApplicationDate(application.updatedAt)}`}
      />

      <ConditionalRenderer when={Boolean(lifecycle)}>
        <ApplicationLifecycleSteps
          currentStepIndex={lifecycle?.currentStepIndex ?? 0}
          stepStatuses={lifecycle?.stepStatuses ?? []}
        />
      </ConditionalRenderer>

      <Card title={ME_APPLICATION_UI_COPY.sectionIdentity} size="small">
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label="Name">
            {[application.candidate?.firstName, application.candidate?.lastName]
              .filter(Boolean)
              .join(" ") || "—"}
          </Descriptions.Item>
          <Descriptions.Item label={ME_APPLICATION_UI_COPY.jambRegNo}>
            {application.candidate?.jambRegNo ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label={ME_APPLICATION_UI_COPY.cycle}>
            {application.candidate?.cycle?.name ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label={ME_APPLICATION_UI_COPY.stateOfOrigin}>
            {resolveRelatedName(
              application.candidate?.state,
              application.candidate?.stateId,
            )}
          </Descriptions.Item>
          <Descriptions.Item label={ME_APPLICATION_UI_COPY.lga}>
            {resolveRelatedName(
              application.candidate?.lga,
              application.candidate?.lgaId,
            )}
          </Descriptions.Item>
          <Descriptions.Item label={ME_APPLICATION_UI_COPY.entryMode}>
            {application.candidate?.entryMode ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {application.candidate?.email ?? "—"}
          </Descriptions.Item>
          <Descriptions.Item label="Phone">
            {application.candidate?.phone ?? "—"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title={ME_APPLICATION_UI_COPY.sectionProgram} size="small">
        <Descriptions bordered size="small" column={1}>
          <Descriptions.Item label={ME_APPLICATION_UI_COPY.appliedProgram}>
            {application.appliedProgram?.name ?? application.appliedProgramId}
          </Descriptions.Item>
          <Descriptions.Item label={ME_APPLICATION_UI_COPY.matriculated}>
            {application.isMatriculated ? "Yes" : "No"}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <ConditionalRenderer when={flags.showOfferCard}>
        <Card title={ME_APPLICATION_UI_COPY.sectionOffer} size="small">
          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label={ME_APPLICATION_UI_COPY.offeredProgram}>
              {application.offeredProgram?.name ??
                application.offeredProgramId ??
                "—"}
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </ConditionalRenderer>

      <ConditionalRenderer when={flags.showScreeningSection}>
        <Card title={ME_APPLICATION_UI_COPY.sectionScreening} size="small">
          <ConditionalRenderer when={flags.showScreeningPending}>
            <Typography.Text type="secondary">
              {ME_APPLICATION_UI_COPY.scorePending}
            </Typography.Text>
          </ConditionalRenderer>
          <ConditionalRenderer
            when={!flags.showScreeningPending && application.screening != null}
          >
            <Descriptions bordered size="small" column={1}>
              <Descriptions.Item label={ME_APPLICATION_UI_COPY.jambTotal}>
                {application.screening?.jambScore ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label={ME_APPLICATION_UI_COPY.schoolRawScore}>
                {application.screening?.schoolRawScore ?? "—"}
              </Descriptions.Item>
              <Descriptions.Item label={ME_APPLICATION_UI_COPY.aggregateScore}>
                {application.screening?.aggregateScore ?? "—"}
              </Descriptions.Item>
            </Descriptions>
          </ConditionalRenderer>
        </Card>
      </ConditionalRenderer>

      <Card title={ME_APPLICATION_UI_COPY.sectionJamb} size="small">
        <ConditionalRenderer when={flags.showJambSection}>
          <div style={{ overflowX: "auto" }}>
            <Table<MeAdmissionJambScore>
              rowKey="id"
              dataSource={jambScoreRows}
              columns={jambScoreColumns}
              size="small"
              pagination={false}
              bordered
            />
          </div>
        </ConditionalRenderer>
        <ConditionalRenderer when={!flags.showJambSection}>
          <Typography.Text type="secondary">
            {ME_APPLICATION_UI_COPY.noJambScores}
          </Typography.Text>
        </ConditionalRenderer>
      </Card>

      <Card title={ME_APPLICATION_UI_COPY.sectionOlevel} size="small">
        <ApplicationOlevelSection
          sittings={application.candidate?.olevelSittings ?? []}
        />
      </Card>

      <ConditionalRenderer when={flags.showCandidateMetadata}>
        <MetadataRenderer
          title="Other Information"
          value={application.candidate?.metadata}
          variant="descriptions"
          size="small"
          bordered
          column={1}
          hideTitle={true}
        />
      </ConditionalRenderer>

      <ApplicationDocumentsSection candidateId={candidateId} />

      <ConditionalRenderer
        when={
          flags.showDocumentActions &&
          acknowledgementSlipModel != null &&
          printableApplicationModel != null
        }
      >
        {acknowledgementSlipModel ? (
          <AcknowledgementSlip
            model={acknowledgementSlipModel}
            contentRef={slipContentRef}
            showToolbar={false}
          />
        ) : null}
        {printableApplicationModel ? (
          <div className="application-print-source">
            <div
              ref={applicationContentRef}
              className="app-print-batch-wrapper"
              style={{ width: "820px" }}
            >
              <PrintableApplicationDossier model={printableApplicationModel} />
            </div>
          </div>
        ) : null}
      </ConditionalRenderer>
    </>
  );
}
