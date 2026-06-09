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
import { Alert, Button, Form, Input, Modal, Select, Switch, Typography } from "antd";
import { useEffect } from "react";
import { useTransitionStatusFormModal } from "../../hooks/useTransitionStatusModal";
import type { StudentTransitionStatus } from "../../types/student-transition-status";
import { nameRules } from "../../utils/transitionStatusValidators";

export type TransitionStatusFormModalProps = {
  open: boolean;
  target: StudentTransitionStatus | null;
  isInUse: boolean;
  hasNoDefaultInTenant: boolean;
  onClose: () => void;
};

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
  } = state;
  const {
    handleSubmit,
    handleCancel,
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

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
          initialValues={{
            stateCategory: "NEUTRAL",
            isTerminal: false,
            countsTowardsResidency: true,
            appearsOnBroadsheet: true,
            canRegisterCourses: false,
            canAccessPortal: true,
            isDefault: false,
          }}
        >
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

          <Form.Item name="stateCategory" label="State Category">
            <Select
              style={{ height: 40 }}
              options={STATE_CATEGORY_OPTIONS}
              placeholder="Select category"
            />
          </Form.Item>

          <Form.Item
            name="isTerminal"
            label="Terminal Status"
            valuePropName="checked"
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
              style={{ marginBottom: 0 }}
            />
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
