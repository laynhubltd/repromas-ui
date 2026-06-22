import { formatCycleOptionLabel } from "@/features/admission-config/tabs/admission-cycle/utils/admissionCycleDisplay";
import {
  ADMISSION_CANDIDATE_CREATE_UI_COPY,
  CANDIDATE_GENDER_FORM_OPTIONS,
  CANDIDATE_INTAKE_MODE_OPTIONS,
} from "@/shared/constants/admissionCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { MinusCircleOutlined, PlusOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  DatePicker,
  Flex,
  Form,
  Input,
  InputNumber,
  Modal,
  Radio,
  Select,
  Tag,
  Typography,
} from "antd";
import { useAdmissionCandidateFormModal } from "../../hooks/useAdmissionCandidateModal";
import type { CreateAdmissionCandidateResponse } from "../../types/admission-candidate";
import {
  appliedProgramIdRules,
  cycleIdRules,
  emailRules,
  firstNameRules,
  jambRegNoRequiredRules,
  lastNameRules,
  metadataJsonRules,
  stateIdRules,
} from "../../utils/validators";
import { AdmissionCandidateCreateResultPanel } from "./AdmissionCandidateCreateResultPanel";

type AdmissionCandidateFormModalProps = {
  open: boolean;
  defaultCycleId: number | undefined;
  canIngest: boolean;
  onClose: () => void;
  onCreated?: (result: CreateAdmissionCandidateResponse) => void;
};

export function AdmissionCandidateFormModal({
  open,
  defaultCycleId,
  canIngest,
  onClose,
  onCreated,
}: AdmissionCandidateFormModalProps) {
  const token = useToken();
  const { state, actions, flags, form } = useAdmissionCandidateFormModal({
    open,
    defaultCycleId,
    canIngest,
    onClose,
    onCreated,
  });

  const programLabel = state.createResult?.application
    ? actions.resolveProgramLabel(
        state.createResult.application.appliedProgramId,
      )
    : "—";

  const modalTitle = flags.isResultStep
    ? ADMISSION_CANDIDATE_CREATE_UI_COPY.modalTitleResult
    : ADMISSION_CANDIDATE_CREATE_UI_COPY.modalTitle;

  return (
    <Modal
      title={
        <Flex align="center" gap={8} wrap="wrap">
          <span>{modalTitle}</span>
          <ConditionalRenderer
            when={!flags.isResultStep && !!state.cycleStatusLabel}
          >
            <Tag>{state.cycleStatusLabel}</Tag>
          </ConditionalRenderer>
        </Flex>
      }
      open={open}
      onCancel={actions.handleCancel}
      width={720}
      destroyOnHidden
      afterOpenChange={(visible) => {
        if (visible) actions.initForm();
      }}
      footer={
        flags.isResultStep ? (
          <Flex justify="flex-end" gap={8}>
            <Button onClick={actions.handleDone}>
              {ADMISSION_CANDIDATE_CREATE_UI_COPY.done}
            </Button>
            <Button type="primary" onClick={actions.handleViewCandidate}>
              {ADMISSION_CANDIDATE_CREATE_UI_COPY.viewCandidate}
            </Button>
          </Flex>
        ) : (
          <Flex justify="flex-end" gap={8}>
            <Button onClick={actions.handleCancel}>
              {ADMISSION_CANDIDATE_CREATE_UI_COPY.cancel}
            </Button>
            <Button
              type="primary"
              loading={state.isLoading}
              disabled={!canIngest}
              onClick={actions.handleSubmit}
            >
              {ADMISSION_CANDIDATE_CREATE_UI_COPY.create}
            </Button>
          </Flex>
        )
      }
    >
      <ConditionalRenderer when={flags.isResultStep && !!state.createResult}>
        <AdmissionCandidateCreateResultPanel
          result={state.createResult!}
          programLabel={programLabel}
          showBillingHint={flags.showBillingHint}
          hasWarnings={flags.hasWarnings}
        />
      </ConditionalRenderer>

      <ConditionalRenderer when={!flags.isResultStep}>
        <Flex vertical gap={token.paddingMD}>
          <ConditionalRenderer when={!canIngest}>
            <Alert
              type="warning"
              showIcon
              message={ADMISSION_CANDIDATE_CREATE_UI_COPY.intakeClosedBanner}
            />
          </ConditionalRenderer>

          <Form form={form} layout="vertical">
            <Form.Item
              name="cycleId"
              label="Admission cycle"
              rules={cycleIdRules}
            >
              <Select
                placeholder="Select cycle"
                options={state.cycles.map((c) => ({
                  value: c.id,
                  label: formatCycleOptionLabel(c),
                }))}
              />
            </Form.Item>

            <Form.Item label="Intake mode">
              <Radio.Group
                value={state.intakeMode}
                onChange={(e) => actions.handleIntakeModeChange(e.target.value)}
                options={CANDIDATE_INTAKE_MODE_OPTIONS}
              />
              <Typography.Text
                type="secondary"
                style={{ display: "block", marginTop: token.paddingSM }}
              >
                {flags.isManualMode
                  ? ADMISSION_CANDIDATE_CREATE_UI_COPY.manualModeHelper
                  : ADMISSION_CANDIDATE_CREATE_UI_COPY.jambModeHelper}
              </Typography.Text>
            </Form.Item>

            <Flex gap={token.paddingMD}>
              <Form.Item
                name="firstName"
                label="First name"
                rules={firstNameRules}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Last name"
                rules={lastNameRules}
                style={{ flex: 1 }}
              >
                <Input />
              </Form.Item>
            </Flex>

            <Form.Item name="stateId" label="State" rules={stateIdRules}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="Select state"
                options={state.states.map((s) => ({
                  value: s.id,
                  label: s.name,
                }))}
                onChange={actions.handleStateChange}
              />
            </Form.Item>

            <Form.Item name="lgaId" label="LGA">
              <Select
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder={
                  state.selectedStateId ? "Select LGA" : "Select state first"
                }
                disabled={!state.selectedStateId}
                loading={state.isLgasLoading}
                options={state.lgas.map((l) => ({
                  value: l.id,
                  label: l.name,
                }))}
                notFoundContent={
                  state.isLgasLoading
                    ? "Loading LGAs…"
                    : state.selectedStateId
                      ? "No LGAs found for this state"
                      : "Select state first"
                }
              />
            </Form.Item>

            <Form.Item
              name="appliedProgramId"
              label={ADMISSION_CANDIDATE_CREATE_UI_COPY.appliedProgramLabel}
              rules={appliedProgramIdRules}
            >
              <Select
                showSearch
                optionFilterProp="label"
                loading={state.isProgramsLoading}
                placeholder={
                  ADMISSION_CANDIDATE_CREATE_UI_COPY.appliedProgramPlaceholder
                }
                options={state.programOptions}
                notFoundContent={
                  state.isProgramsLoading
                    ? "Loading programs…"
                    : "No programs found"
                }
              />
            </Form.Item>

            <ConditionalRenderer when={flags.isJambMode}>
              <Form.Item
                name="jambRegNo"
                label="JAMB reg. no."
                rules={jambRegNoRequiredRules}
              >
                <Input placeholder="202655999999AA" />
              </Form.Item>

              <Typography.Text strong>
                {ADMISSION_CANDIDATE_CREATE_UI_COPY.jambScoresTitle}
              </Typography.Text>
              <Form.List name="jambScores">
                {(fields, { add, remove }) => (
                  <Flex vertical gap={8} style={{ marginTop: token.paddingSM }}>
                    {fields.map((field) => {
                      const { key, name, ...restField } = field;
                      return (
                        <Flex key={key} gap={8} align="flex-start">
                          <Form.Item
                            {...restField}
                            name={[name, "subjectId"]}
                            style={{ flex: 1, marginBottom: 0 }}
                          >
                            <Select
                              showSearch
                              optionFilterProp="label"
                              placeholder="Subject"
                              allowClear
                              options={state.subjectOptions}
                            />
                          </Form.Item>
                          <Form.Item
                            {...restField}
                            name={[name, "score"]}
                            style={{ width: 120, marginBottom: 0 }}
                          >
                            <InputNumber
                              min={0}
                              max={100}
                              placeholder="Score"
                              style={{ width: "100%" }}
                            />
                          </Form.Item>
                          <Button
                            type="text"
                            icon={<MinusCircleOutlined />}
                            onClick={() => remove(name)}
                            aria-label="Remove score row"
                          />
                        </Flex>
                      );
                    })}
                    <Button
                      type="dashed"
                      onClick={() =>
                        add({ subjectId: undefined, score: undefined })
                      }
                      icon={<PlusOutlined />}
                      style={{ alignSelf: "flex-start" }}
                    >
                      {ADMISSION_CANDIDATE_CREATE_UI_COPY.addScoreRow}
                    </Button>
                  </Flex>
                )}
              </Form.List>
            </ConditionalRenderer>

            <Form.Item name="dateOfBirth" label="Date of birth">
              <DatePicker style={{ width: "100%" }} />
            </Form.Item>

            <Form.Item name="gender" label="Gender">
              <Select
                allowClear
                placeholder="Select gender"
                options={CANDIDATE_GENDER_FORM_OPTIONS}
              />
            </Form.Item>

            <Form.Item name="email" label="Email" rules={emailRules}>
              <Input type="email" />
            </Form.Item>

            <Form.Item name="phone" label="Phone">
              <Input />
            </Form.Item>

            <Form.Item
              name="metadataJson"
              label="Metadata (JSON)"
              rules={metadataJsonRules}
            >
              <Input.TextArea rows={3} placeholder='{"source":"manual"}' />
            </Form.Item>
          </Form>
        </Flex>
      </ConditionalRenderer>
    </Modal>
  );
}
