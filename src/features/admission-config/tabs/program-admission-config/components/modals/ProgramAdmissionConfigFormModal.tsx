import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Button, Form, InputNumber, Modal, Select, Space, Typography } from "antd";
import { useMemo } from "react";
import { useProgramAdmissionConfigFormModal } from "../../hooks/useProgramAdmissionConfigModal";
import type { ProgramAdmissionConfig } from "../../types/program-admission-config";
import { computeQuotaSeats } from "../../utils/seatMath";
import {
  cutoffRules,
  programIdRules,
  quotaPercentageRules,
  totalCapacityRules,
} from "../../utils/validators";

type ProgramAdmissionConfigFormModalProps = {
  open: boolean;
  target: ProgramAdmissionConfig | null;
  onClose: () => void;
  programs: { id: number; name: string; department?: { name: string } | null }[];
  configs: ProgramAdmissionConfig[];
};

export function ProgramAdmissionConfigFormModal({
  open,
  target,
  onClose,
  programs,
  configs,
}: ProgramAdmissionConfigFormModalProps) {
  const token = useToken();
  const {
    state: {
      isEditMode,
      formError,
      isSubmitting,
      programLocked,
      totalSeatsUsed,
      programOptions,
    },
    actions: { handleSubmit, handleCancel, applyFederalPreset },
    form,
  } = useProgramAdmissionConfigFormModal(target, open, onClose, programs, configs);

  const totalCapacity = Form.useWatch("totalCapacity", form);
  const meritPercentage = Form.useWatch("meritPercentage", form);
  const catchmentPercentage = Form.useWatch("catchmentPercentage", form);
  const eldsPercentage = Form.useWatch("eldsPercentage", form);

  const quotaSum =
    Number(meritPercentage ?? 0) +
    Number(catchmentPercentage ?? 0) +
    Number(eldsPercentage ?? 0);

  const seatsPreview = useMemo(() => {
    if (
      totalCapacity === undefined ||
      meritPercentage === undefined ||
      catchmentPercentage === undefined ||
      eldsPercentage === undefined
    ) {
      return null;
    }
    return computeQuotaSeats({
      totalCapacity,
      meritPercentage,
      catchmentPercentage,
      eldsPercentage,
      meritSeatsUsed: target?.meritSeatsUsed ?? 0,
      catchmentSeatsUsed: target?.catchmentSeatsUsed ?? 0,
      eldsSeatsUsed: target?.eldsSeatsUsed ?? 0,
    });
  }, [
    totalCapacity,
    meritPercentage,
    catchmentPercentage,
    eldsPercentage,
    target?.meritSeatsUsed,
    target?.catchmentSeatsUsed,
    target?.eldsSeatsUsed,
  ]);

  return (
    <Modal
      title={isEditMode ? "Edit Admission Cut-offs/Quota" : "Create Admission Cut-offs/Quota"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={640}
      destroyOnHidden
      closable
    >
      <ErrorAlert error={formError} />
      <Form
        form={form}
        layout="vertical"
        requiredMark={false}
        onFinish={handleSubmit}
      >
        <Form.Item
          name="programId"
          label="Program"
          rules={programIdRules}
          extra={
            programLocked
              ? "Program cannot be changed after slots have been allocated."
              : undefined
          }
        >
          <Select
            placeholder="Select program"
            options={programOptions}
            showSearch
            optionFilterProp="label"
            disabled={programLocked}
          />
        </Form.Item>

        <Form.Item
          name="totalCapacity"
          label="Total capacity"
          rules={totalCapacityRules}
        >
          <InputNumber style={{ width: "100%" }} min={1} precision={0} />
        </Form.Item>

        <Space size={8} style={{ marginBottom: 12 }}>
          <Typography.Text strong>Quota split (%)</Typography.Text>
          <Button type="link" size="small" onClick={applyFederalPreset}>
            Apply 45/30/25 preset
          </Button>
        </Space>

        <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
          <Form.Item
            name="meritPercentage"
            label="Merit %"
            rules={quotaPercentageRules}
            style={{ width: "33%" }}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} precision={0} />
          </Form.Item>
          <Form.Item
            name="catchmentPercentage"
            label="Catchment %"
            rules={quotaPercentageRules}
            style={{ width: "33%" }}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} precision={0} />
          </Form.Item>
          <Form.Item
            name="eldsPercentage"
            label="ELDS %"
            rules={quotaPercentageRules}
            style={{ width: "34%" }}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} precision={0} />
          </Form.Item>
        </Space.Compact>

        <Typography.Text
          type={quotaSum === 100 ? "secondary" : "danger"}
          style={{ display: "block", marginBottom: 16 }}
        >
          Quota total: {quotaSum}% (must be exactly 100%)
        </Typography.Text>

        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
          Minimum cut-offs
        </Typography.Text>
        <Space.Compact style={{ width: "100%", marginBottom: 8 }}>
          <Form.Item
            name="meritCutoff"
            label="Merit"
            rules={cutoffRules}
            style={{ width: "33%" }}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} precision={2} />
          </Form.Item>
          <Form.Item
            name="catchmentCutoff"
            label="Catchment"
            rules={cutoffRules}
            style={{ width: "33%" }}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} precision={2} />
          </Form.Item>
          <Form.Item
            name="eldsCutoff"
            label="ELDS"
            rules={cutoffRules}
            style={{ width: "34%" }}
          >
            <InputNumber style={{ width: "100%" }} min={0} max={100} precision={2} />
          </Form.Item>
        </Space.Compact>
        <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
          Ordering rule: Merit cut-off must be greater than or equal to Catchment, and Catchment greater than or equal to ELDS.
        </Typography.Text>

        <ConditionalRenderer when={seatsPreview !== null}>
          <div
            style={{
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: token.borderRadius,
              background: token.colorBgLayout,
              padding: token.paddingSM,
              marginBottom: 16,
            }}
          >
            <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
              Slot allocation preview
            </Typography.Text>
            <Typography.Text type="secondary" style={{ display: "block" }}>
              Merit: {seatsPreview?.meritAllocated} allocated, {seatsPreview?.meritAvailable} available
            </Typography.Text>
            <Typography.Text type="secondary" style={{ display: "block" }}>
              Catchment: {seatsPreview?.catchmentAllocated} allocated, {seatsPreview?.catchmentAvailable} available
            </Typography.Text>
            <Typography.Text type="secondary" style={{ display: "block" }}>
              ELDS: {seatsPreview?.eldsAllocated} allocated, {seatsPreview?.eldsAvailable} available
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={isEditMode && totalSeatsUsed > 0}>
          <Typography.Text type="warning" style={{ display: "block", marginBottom: 16 }}>
            {totalSeatsUsed} slots have already been used. Reducing capacity or quota percentages below used slots will be rejected by the API.
          </Typography.Text>
        </ConditionalRenderer>

        <Form.Item style={{ marginBottom: 0 }}>
          <Space style={{ width: "100%", justifyContent: "flex-end" }}>
            <Button onClick={handleCancel}>Cancel</Button>
            <PermissionGuard
              permission={
                isEditMode
                  ? Permission.AdmissionProgramAdmissionConfigsUpdate
                  : Permission.AdmissionProgramAdmissionConfigsCreate
              }
            >
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                {isEditMode ? "Save Changes" : "Create Config"}
              </Button>
            </PermissionGuard>
          </Space>
        </Form.Item>
      </Form>
    </Modal>
  );
}
