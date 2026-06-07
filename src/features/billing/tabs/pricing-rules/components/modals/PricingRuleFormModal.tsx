import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetAcademicSessionsQuery } from "@/features/settings/tabs/academic-calendar/api/academicCalendarApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import {
  INDIGENE_STATUS_OPTIONS,
  PRICING_RULE_SCOPE_OPTIONS,
  PRICING_RULE_TOOLTIPS,
  PRICING_RULE_UI_COPY,
  STUDENT_CATEGORY_OPTIONS,
} from "@/shared/constants/pricingRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Flex, Form, Input, InputNumber, Modal, Select, Steps, Switch, Typography } from "antd";
import { useMemo } from "react";
import {
  usePricingRuleFormModal,
  type PricingRuleCreatePrefill,
} from "../../hooks/usePricingRuleModal";
import type { BillableEvent } from "@/features/billing/tabs/fee-events/types/billable-event";
import type { FeeEventsTabLabelMaps } from "@/features/billing/tabs/fee-events/types/fee-events-tab";
import {
  formatVersionNoLabel,
  getPolicyEmbedOccurrenceLine,
  getPricingRulePolicyDisplay,
} from "../../utils/pricingRuleDisplay";
import type { PricingRule } from "../../types/pricing-rule";
import { PricingRuleLineEditor } from "../PricingRuleLineEditor";
import {
  billableEventPolicyIdRules,
  effectiveFromRules,
  eventCodeRules,
  indigeneStatusRules,
  itemsMinRules,
  priorityRules,
  referenceIdRules,
  scopeRules,
} from "../../utils/validators";

type PricingRuleFormModalProps = {
  open: boolean;
  target: PricingRule | null;
  onClose: () => void;
  eventCodeOptions: { value: string; label: string }[];
  configuredEventCodes: Set<string>;
  eventByCode?: Map<string, BillableEvent>;
  labelMaps: FeeEventsTabLabelMaps;
  createPrefill?: PricingRuleCreatePrefill;
  initialLocked?: boolean;
  onRuleLocked?: (id: number) => void;
};

const CREATE_STEPS = [
  { title: "Fee event" },
  { title: "Dimensions" },
  { title: "Fee lines" },
];

export function PricingRuleFormModal({
  open,
  target,
  onClose,
  eventCodeOptions,
  configuredEventCodes,
  eventByCode = new Map(),
  labelMaps,
  createPrefill,
  initialLocked = false,
  onRuleLocked,
}: PricingRuleFormModalProps) {
  const token = useToken();

  const {
    state: {
      isEditMode,
      formError,
      isSubmitting,
      createStep,
      isLocked,
      retireReplaceMode,
      showBalanceWarning,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleNextStep,
      handlePrevStep,
      enterRetireReplaceMode,
      syncPolicyFromEvent,
    },
    form,
  } = usePricingRuleFormModal({
    target,
    open,
    onClose,
    initialLocked,
    onRuleLocked,
    createPrefill,
    eventByCode,
  });

  const scopeValue = Form.useWatch("scope", form);
  const eventCodeValue = Form.useWatch("eventCode", form);
  const policyIdValue = Form.useWatch("billableEventPolicyId", form);
  const selectedEvent = eventCodeValue
    ? eventByCode.get(eventCodeValue)
    : undefined;
  const policyVersionNo =
    selectedEvent?.currentPolicy?.id === policyIdValue
      ? selectedEvent?.currentPolicy?.versionNo
      : createPrefill?.billableEventPolicyId === policyIdValue
        ? createPrefill?.policyVersionNo
        : undefined;

  const policyOccurrenceLine = useMemo(() => {
    if (
      selectedEvent?.currentPolicy &&
      selectedEvent.currentPolicy.id === policyIdValue
    ) {
      return getPolicyEmbedOccurrenceLine(selectedEvent.currentPolicy, labelMaps);
    }
    if (target?.policy && target.billableEventPolicyId === policyIdValue) {
      return getPricingRulePolicyDisplay(target, labelMaps).occurrenceLine;
    }
    return null;
  }, [selectedEvent, policyIdValue, target, labelMaps]);

  const isCreateFlow = !isEditMode;
  const showFullForm = !isLocked || retireReplaceMode;
  const showLineEditor = showFullForm && (!isCreateFlow || createStep === 2);
  const showDimensions = showFullForm && (!isCreateFlow || createStep >= 1);
  const showEventStep = !isEditMode && createStep === 0;

  const shouldFetchFaculties = open && scopeValue === "FACULTY" && showDimensions;
  const shouldFetchDepartments = open && scopeValue === "DEPARTMENT" && showDimensions;
  const shouldFetchPrograms = open && scopeValue === "PROGRAM" && showDimensions;

  const { data: facultiesData, isLoading: isFacultiesLoading } =
    useGetFacultiesQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchFaculties },
    );

  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchDepartments },
    );

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchPrograms },
    );

  const { data: sessionsData, isLoading: isSessionsLoading } =
    useGetAcademicSessionsQuery(
      { sort: "name:desc", itemsPerPage: 100 },
      { skip: !open || !showDimensions },
    );

  const { data: levelsData, isLoading: isLevelsLoading } = useGetLevelsQuery(
    { sort: "rankOrder:asc", itemsPerPage: 100 },
    { skip: !open || !showDimensions },
  );

  const referenceOptions = useMemo(() => {
    if (scopeValue === "FACULTY") {
      return (facultiesData?.member ?? []).map((f) => ({
        value: f.id,
        label: f.name,
      }));
    }
    if (scopeValue === "DEPARTMENT") {
      return (departmentsData?.member ?? []).map((d) => ({
        value: d.id,
        label: d.name,
      }));
    }
    if (scopeValue === "PROGRAM") {
      return (programsData?.member ?? []).map((p) => ({
        value: p.id,
        label: p.name,
      }));
    }
    return [];
  }, [scopeValue, facultiesData, departmentsData, programsData]);

  const sessionOptions = useMemo(
    () =>
      (sessionsData?.member ?? []).map((s) => ({
        value: s.id,
        label: s.name,
      })),
    [sessionsData],
  );

  const levelOptions = useMemo(
    () =>
      (levelsData?.member ?? []).map((l) => ({
        value: l.id,
        label: l.name,
      })),
    [levelsData],
  );

  const isLoadingRefs =
    isFacultiesLoading || isDepartmentsLoading || isProgramsLoading;

  const eventMissingFromBillables =
    eventCodeValue && !configuredEventCodes.has(eventCodeValue);

  const modalTitle = retireReplaceMode
    ? "Create New Pricing Version"
    : isEditMode
      ? isLocked
        ? "Edit Pricing Rule (Limited)"
        : "Edit Pricing Rule"
      : "Create Pricing Rule";

  const submitLabel = retireReplaceMode
    ? "Retire & Create New Version"
    : isEditMode
      ? "Save Changes"
      : createStep < 2
        ? "Continue"
        : "Create Rule";

  const handlePrimaryAction = async () => {
    if (isCreateFlow && createStep < 2) {
      await handleNextStep();
      return;
    }
    await handleSubmit();
  };

  return (
    <Modal
      title={modalTitle}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={720}
      destroyOnHidden
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <ErrorAlert variant="form" error={formError} />

        {isCreateFlow ? (
          <Steps
            current={createStep}
            items={CREATE_STEPS}
            size="small"
            style={{ marginBottom: 24 }}
          />
        ) : null}

        {isLocked && !retireReplaceMode ? (
          <Alert
            type="info"
            showIcon
            title="Rule is locked"
            description={PRICING_RULE_UI_COPY.lockedHelp}
            style={{ marginBottom: 16 }}
            action={
              <PermissionGuard permission={Permission.BillingPricingRulesCreate}>
                <Button size="small" onClick={enterRetireReplaceMode}>
                  Retire & replace
                </Button>
              </PermissionGuard>
            }
          />
        ) : null}

        {showBalanceWarning && isEditMode && !retireReplaceMode ? (
          <Alert
            type="warning"
            showIcon
            title={PRICING_RULE_UI_COPY.balanceWarning}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        {retireReplaceMode ? (
          <Alert
            type="info"
            showIcon
            title={PRICING_RULE_UI_COPY.retireReplaceTitle}
            description={PRICING_RULE_UI_COPY.retireReplaceBody}
            style={{ marginBottom: 16 }}
          />
        ) : null}

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          preserve
        >
          <div
            style={{
              display:
                showEventStep || (isEditMode && showFullForm) ? "block" : "none",
            }}
          >
            <Form.Item
              name="eventCode"
              label="Fee event"
              rules={
                showEventStep || (isEditMode && showFullForm)
                  ? eventCodeRules
                  : []
              }
              preserve
              extra={PRICING_RULE_TOOLTIPS.eventCode}
            >
              <Select
                placeholder="Select billable fee"
                options={eventCodeOptions}
                showSearch
                optionFilterProp="label"
                disabled={isLocked && !retireReplaceMode}
                style={{ width: "100%" }}
                onChange={(code: string) => syncPolicyFromEvent(code)}
              />
            </Form.Item>

            <Form.Item name="billableEventPolicyId" hidden rules={billableEventPolicyIdRules}>
              <Input type="hidden" />
            </Form.Item>

            {eventCodeValue && !policyIdValue ? (
              <Alert
                type="warning"
                showIcon
                title={PRICING_RULE_UI_COPY.publishPolicyFirst}
                description={PRICING_RULE_UI_COPY.noPolicyForEvent}
                style={{ marginBottom: 16 }}
              />
            ) : null}

            {policyIdValue ? (
              <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
                {PRICING_RULE_UI_COPY.policyBindingReadOnly}{" "}
                {formatVersionNoLabel(policyVersionNo) ? (
                  <Typography.Text strong>
                    {formatVersionNoLabel(policyVersionNo)}
                  </Typography.Text>
                ) : (
                  <Typography.Text type="secondary">
                    {PRICING_RULE_UI_COPY.policyVersionUnknown}
                  </Typography.Text>
                )}
                {policyOccurrenceLine && policyOccurrenceLine !== "—" ? (
                  <>
                    {" "}
                    · {PRICING_RULE_UI_COPY.policyOccurrenceLabel}:{" "}
                    <Typography.Text>{policyOccurrenceLine}</Typography.Text>
                  </>
                ) : null}
                {selectedEvent?.currentPolicy?.isActive === false ? (
                  <Typography.Text type="warning">
                    {" "}
                    (not the active policy)
                  </Typography.Text>
                ) : null}
              </Typography.Text>
            ) : null}

            {eventMissingFromBillables ? (
              <Alert
                type="warning"
                showIcon
                title="This fee is not configured on the Fees tab."
                style={{ marginBottom: 16 }}
              />
            ) : null}
          </div>

          <div style={{ display: showDimensions ? "block" : "none" }}>
            <Flex gap={16} wrap="wrap">
              <Form.Item
                name="scope"
                label="Scope"
                rules={showDimensions ? scopeRules : []}
                preserve
                style={{ flex: "1 1 200px" }}
                extra={PRICING_RULE_TOOLTIPS.scope}
              >
                <Select
                  options={PRICING_RULE_SCOPE_OPTIONS}
                  disabled={isLocked && !retireReplaceMode}
                  onChange={() => form.setFieldValue("referenceId", undefined)}
                />
              </Form.Item>

              {scopeValue && scopeValue !== "GLOBAL" ? (
                <Form.Item
                  name="referenceId"
                  label="Reference"
                  rules={showDimensions ? referenceIdRules : []}
                  preserve
                  style={{ flex: "1 1 200px" }}
                  extra={PRICING_RULE_TOOLTIPS.referenceId}
                >
                  <Select
                    placeholder="Select reference"
                    options={referenceOptions}
                    loading={isLoadingRefs}
                    showSearch
                    optionFilterProp="label"
                    disabled={isLocked && !retireReplaceMode}
                  />
                </Form.Item>
              ) : null}
            </Flex>

            <Flex gap={16} wrap="wrap">
              <Form.Item
                name="indigeneStatus"
                label="Indigene status"
                rules={showDimensions ? indigeneStatusRules : []}
                preserve
                style={{ flex: "1 1 180px" }}
                extra={PRICING_RULE_TOOLTIPS.indigeneStatus}
              >
                <Select
                  options={INDIGENE_STATUS_OPTIONS}
                  disabled={isLocked && !retireReplaceMode}
                />
              </Form.Item>

              <Form.Item
                name="studentCategory"
                label="Student category (optional)"
                style={{ flex: "1 1 180px" }}
              >
                <Select
                  allowClear
                  placeholder="Any category"
                  options={STUDENT_CATEGORY_OPTIONS}
                  disabled={isLocked && !retireReplaceMode}
                />
              </Form.Item>
            </Flex>

            <Flex gap={16} wrap="wrap">
              <Form.Item
                name="academicSessionId"
                label="Academic session (optional)"
                style={{ flex: "1 1 200px" }}
              >
                <Select
                  allowClear
                  placeholder="Any session"
                  options={sessionOptions}
                  loading={isSessionsLoading}
                  disabled={isLocked && !retireReplaceMode}
                />
              </Form.Item>

              <Form.Item
                name="levelId"
                label="Level (optional)"
                style={{ flex: "1 1 200px" }}
              >
                <Select
                  allowClear
                  placeholder="Any level"
                  options={levelOptions}
                  loading={isLevelsLoading}
                  disabled={isLocked && !retireReplaceMode}
                />
              </Form.Item>
            </Flex>

            <Flex gap={16} wrap="wrap">
              <Form.Item
                name="effectiveFrom"
                label="Effective from"
                rules={
                  showDimensions && !(isLocked && !retireReplaceMode)
                    ? effectiveFromRules
                    : []
                }
                preserve
                style={{ flex: "1 1 160px" }}
                extra={PRICING_RULE_TOOLTIPS.effectiveFrom}
              >
                <Input
                  type="date"
                  disabled={isLocked && !retireReplaceMode}
                  style={{ height: 40 }}
                />
              </Form.Item>

              <Form.Item
                name="effectiveTo"
                label="Effective to (optional)"
                style={{ flex: "1 1 160px" }}
                extra={PRICING_RULE_TOOLTIPS.effectiveTo}
              >
                <Input type="date" style={{ height: 40 }} />
              </Form.Item>

              <Form.Item
                name="priority"
                label="Priority"
                rules={showDimensions ? priorityRules : []}
                style={{ flex: "0 1 120px" }}
                extra={PRICING_RULE_TOOLTIPS.priority}
              >
                <InputNumber min={0} precision={0} style={{ width: "100%" }} />
              </Form.Item>

              <Form.Item
                name="isActive"
                label="Active"
                valuePropName="checked"
                style={{ flex: "0 0 auto" }}
              >
                <Switch />
              </Form.Item>
            </Flex>
          </div>

          <div style={{ display: showLineEditor ? "block" : "none" }}>
            <Typography.Title level={5} style={{ marginTop: 8 }}>
              Fee lines
            </Typography.Title>
            <Form.Item
              name="items"
              rules={showLineEditor ? itemsMinRules : []}
              preserve
            >
              <PricingRuleLineEditor
                form={form}
                disabled={isLocked && !retireReplaceMode}
                validateLines={showLineEditor}
              />
            </Form.Item>
          </div>

          <Flex gap={8} style={{ marginTop: 16 }}>
            {isCreateFlow && createStep > 0 ? (
              <Button onClick={handlePrevStep} disabled={isSubmitting}>
                Back
              </Button>
            ) : null}

            <PermissionGuard
              permission={
                isEditMode && !retireReplaceMode
                  ? Permission.BillingPricingRulesUpdate
                  : Permission.BillingPricingRulesCreate
              }
            >
              <Button
                type="primary"
                htmlType="button"
                loading={isSubmitting}
                disabled={isSubmitting}
                onClick={() => void handlePrimaryAction()}
                style={{ flex: 1, height: 48, fontWeight: 600 }}
              >
                {submitLabel}
              </Button>
            </PermissionGuard>
          </Flex>
        </Form>
      </div>

      <div
        style={{
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isSubmitting}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
