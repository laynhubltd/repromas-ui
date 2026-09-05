// Feature: student-transition-status
import { ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  STATE_CATEGORY_OPTIONS,
  TRANSITION_STATUS_DEFAULT_WARNING,
  TRANSITION_STATUS_NO_DEFAULT_CALLOUT,
} from "@/shared/constants/studentTransitionStatusOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import {
  Alert,
  Button,
  Flex,
  Form,
  Input,
  Modal,
  Select,
  Switch,
  Typography,
} from "antd";
import React, { useEffect } from "react";
import { useTransitionStatusFormModal } from "../../hooks/useTransitionStatusModal";
import type {
  SemanticKind,
  StudentTransitionStatus,
} from "../../types/student-transition-status";
import {
  ALL_SEMANTIC_KINDS,
  MANAGED_BY_OPTIONS,
  SEMANTIC_KIND_LABELS,
  getSemanticKindIcon,
} from "../../utils/semanticKindPresentation";
import { nameRules } from "../../utils/transitionStatusValidators";

export type TransitionStatusFormModalProps = {
  open: boolean;
  target: StudentTransitionStatus | null;
  isInUse: boolean;
  hasNoDefaultInTenant: boolean;
  onClose: () => void;
};

const SEMANTIC_KIND_OPTIONS = ALL_SEMANTIC_KINDS.map((kind) => ({
  value: kind,
  label: (
    <Flex align="center" gap={8}>
      {getSemanticKindIcon(kind)}
      <span>{SEMANTIC_KIND_LABELS[kind]}</span>
    </Flex>
  ),
}));

export function TransitionStatusFormModal({
  open,
  target,
  isInUse: isInUseProp,
  hasNoDefaultInTenant,
  onClose,
}: TransitionStatusFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useTransitionStatusFormModal(
    target,
    open,
    onClose,
  );
  const {
    isLoading,
    isEditMode,
    isInUse,
    showCourseRegWarning,
    isDefault,
    isDefaultSwitchDisabled,
    presetNote,
    coherenceWarnings,
  } = state;
  const {
    handleSubmit,
    handleCancel,
    handleSemanticKindChange,
    handleManagedByChange,
    dismissPresetNote,
    handleCanRegisterCoursesChange,
    handleIsDefaultChange,
    setIsInUse,
  } = actions;

  useEffect(() => {
    if (open) {
      setIsInUse(isInUseProp);
    }
  }, [open, isInUseProp, setIsInUse]);

  const showNoDefaultCallout = hasNoDefaultInTenant && !isEditMode;

  return (
    <Modal
      title={isEditMode ? "Edit Transition Status" : "Create Transition Status"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={640}
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
        <ConditionalRenderer when={showNoDefaultCallout}>
          <div style={{ marginBottom: 16 }}>
            <ExplainerCallout
              intent="warning"
              title="Default status required"
              body={TRANSITION_STATUS_NO_DEFAULT_CALLOUT}
            />
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={isInUse}>
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="warning"
              showIcon
              message="This status is currently assigned to active students. Changes take effect immediately."
            />
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={showCourseRegWarning}>
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="error"
              showIcon
              message="Disabling course registration will immediately prevent all students in this status from registering for courses."
            />
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={presetNote !== null}>
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="info"
              showIcon
              closable
              onClose={dismissPresetNote}
              message={presetNote}
            />
          </div>
        </ConditionalRenderer>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{
            semanticKind: "OTHER",
            managedBy: "BOTH",
            stateCategory: "NEUTRAL",
            levelProgression: "RETAIN",
            isTerminal: false,
            exemptFromEvaluation: false,
            countsTowardCareerCap: true,
            countsTowardsResidency: true,
            appearsOnBroadsheet: true,
            canRegisterCourses: false,
            canAccessPortal: true,
            isDefault: false,
          }}
        >
          {/* Surface 1: Status Type selector — FIRST FIELD */}
          <Form.Item
            name="semanticKind"
            label="Status Type (Universal Academic Classification)"
            extra="What this status represents in universal academic terms. Used for reports, badges, and accreditation returns — it never changes engine behavior."
          >
            <Select
              style={{ height: 40 }}
              options={SEMANTIC_KIND_OPTIONS}
              onChange={handleSemanticKindChange}
              placeholder="Select universal status type"
            />
          </Form.Item>

          <Form.Item
            name="name"
            label={
              <span>
                Name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={nameRules}
          >
            <Input placeholder="e.g. Active Enrollment" style={{ height: 40 }} />
          </Form.Item>

          {/* Managed By */}
          <Form.Item
            name="managedBy"
            label="Managed By"
            extra="Admin only: Only staff can place or remove this status (e.g. Deferment, Suspension). The academic standing engine will refuse to assign it, and policy screens won't offer it."
          >
            <Select
              style={{ height: 40 }}
              options={MANAGED_BY_OPTIONS}
              onChange={handleManagedByChange}
              placeholder="Select management authority"
            />
          </Form.Item>

          <Form.Item name="stateCategory" label="State Category">
            <Select
              style={{ height: 40 }}
              options={STATE_CATEGORY_OPTIONS}
              placeholder="Select category"
            />
          </Form.Item>

          <Form.Item name="levelProgression" label="Level Progression Intent">
            <Select
              style={{ height: 40 }}
              options={[
                { value: "PROMOTE", label: "Promote (Advance to Next Level)" },
                { value: "RETAIN", label: "Retain (Remain in Current Level)" },
              ]}
              placeholder="Select progression intent"
            />
          </Form.Item>

          <Form.Item
            name="isTerminal"
            label="Terminal Status"
            valuePropName="checked"
            extra="Concludes the student's academic career (e.g. Graduated, Withdrawn, Expelled)."
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="exemptFromEvaluation"
            label="Exempt From Evaluation"
            valuePropName="checked"
            extra="Skip students holding this status during batch academic standing evaluation (e.g. Official Leave of Absence, Deferred Admission)."
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="countsTowardCareerCap"
            label="Counts Toward Career Probation Cap"
            valuePropName="checked"
            extra="Count occurrences of NEGATIVE outcomes against policy probation career limit (maxProbationsPerCareer)."
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="countsTowardsResidency"
            label="Counts Towards Residency"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="appearsOnBroadsheet"
            label="Appears on Broadsheet"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="canRegisterCourses"
            label="Can Register Courses"
            valuePropName="checked"
          >
            <Switch onChange={handleCanRegisterCoursesChange} />
          </Form.Item>
          <div style={{ marginTop: -16, marginBottom: 16 }}>
            <Typography.Text
              type="secondary"
              style={{ fontSize: token.fontSizeSM }}
            >
              Enabling this allows students in this status to register for
              courses.
            </Typography.Text>
          </div>

          <Form.Item
            name="canAccessPortal"
            label="Can Access Portal"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="isDefault"
            label="Default Status"
            valuePropName="checked"
            style={{ marginBottom: isDefault ? 8 : 0 }}
            extra={
              isDefaultSwitchDisabled
                ? "The current default cannot be unset. Set another status as default to change."
                : undefined
            }
          >
            <Switch
              onChange={handleIsDefaultChange}
              disabled={isDefaultSwitchDisabled}
            />
          </Form.Item>

          <ConditionalRenderer when={isDefault && !isDefaultSwitchDisabled}>
            <Alert
              type="warning"
              showIcon
              message={TRANSITION_STATUS_DEFAULT_WARNING}
              style={{ marginBottom: 16 }}
            />
          </ConditionalRenderer>

          {/* Coherence Lint Warnings */}
          <ConditionalRenderer when={coherenceWarnings.length > 0}>
            <Flex vertical gap={8} style={{ marginTop: 16 }}>
              {coherenceWarnings.map((warning) => (
                <Alert
                  key={warning}
                  type="warning"
                  showIcon
                  message={warning}
                />
              ))}
            </Flex>
          </ConditionalRenderer>
        </Form>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <PermissionGuard
          permission={
            isEditMode
              ? Permission.StudentTransitionStatusesUpdate
              : Permission.StudentTransitionStatusesCreate
          }
        >
          <Button
            type="primary"
            loading={isLoading}
            disabled={isLoading}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Changes" : "Create Status"}
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
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
