import type { FormInstance } from "antd";
import { Button, Form, InputNumber, Space, Typography } from "antd";
import type { ProgramAdmissionConfig } from "../../types/program-admission-config";
import { computeQuotaSeats } from "../../utils/seatMath";
import {
  quotaPercentageRules,
  totalCapacityRules,
} from "../../utils/validators";

type CapacityQuotaFieldsProps = {
  form: FormInstance;
  target: ProgramAdmissionConfig | null;
  onApplyFederalPreset: () => void;
};

export function CapacityQuotaFields({
  form,
  target,
  onApplyFederalPreset,
}: CapacityQuotaFieldsProps) {
  const totalCapacity = Form.useWatch("totalCapacity", form);
  const meritPercentage = Form.useWatch("meritPercentage", form);
  const catchmentPercentage = Form.useWatch("catchmentPercentage", form);
  const eldsPercentage = Form.useWatch("eldsPercentage", form);

  const quotaSum =
    Number(meritPercentage ?? 0) +
    Number(catchmentPercentage ?? 0) +
    Number(eldsPercentage ?? 0);

  const seatsPreview =
    totalCapacity !== undefined &&
    meritPercentage !== undefined &&
    catchmentPercentage !== undefined &&
    eldsPercentage !== undefined
      ? computeQuotaSeats({
          totalCapacity,
          meritPercentage,
          catchmentPercentage,
          eldsPercentage,
          meritSeatsUsed: target?.meritSeatsUsed ?? 0,
          catchmentSeatsUsed: target?.catchmentSeatsUsed ?? 0,
          eldsSeatsUsed: target?.eldsSeatsUsed ?? 0,
        })
      : null;

  return (
    <>
      <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
        Capacity &amp; quota
      </Typography.Text>

      <Form.Item
        name="totalCapacity"
        label="Total capacity"
        rules={totalCapacityRules}
      >
        <InputNumber style={{ width: "100%" }} min={1} precision={0} />
      </Form.Item>

      <Space size={8} style={{ marginBottom: 12 }}>
        <Typography.Text strong>Quota split (%)</Typography.Text>
        <Button type="link" size="small" onClick={onApplyFederalPreset}>
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

      {seatsPreview && (
        <div style={{ marginBottom: 16 }}>
          <Typography.Text strong style={{ display: "block", marginBottom: 4 }}>
            Slot allocation preview
          </Typography.Text>
          <Typography.Text type="secondary" style={{ display: "block" }}>
            Merit: {seatsPreview.meritAllocated} allocated,{" "}
            {seatsPreview.meritAvailable} available
          </Typography.Text>
          <Typography.Text type="secondary" style={{ display: "block" }}>
            Catchment: {seatsPreview.catchmentAllocated} allocated,{" "}
            {seatsPreview.catchmentAvailable} available
          </Typography.Text>
          <Typography.Text type="secondary" style={{ display: "block" }}>
            ELDS: {seatsPreview.eldsAllocated} allocated,{" "}
            {seatsPreview.eldsAvailable} available
          </Typography.Text>
        </div>
      )}
    </>
  );
}
