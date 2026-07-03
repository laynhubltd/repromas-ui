import { COUNTER_PARTITION_OPTIONS } from "@/shared/constants/matricNumberFormatOptions";
import type { CounterPartition } from "../types/matric-number-format";
import { useToken } from "@/shared/hooks/useToken";
import { Flex, InputNumber, Radio, Typography } from "antd";

type CounterPartitionFieldsProps = {
  counterPartition: CounterPartition;
  sequencePadding: number;
  initialValue: number;
  readOnly?: boolean;
  onCounterPartitionChange: (value: CounterPartition) => void;
  onSequencePaddingChange: (value: number) => void;
  onInitialValueChange: (value: number) => void;
};

export function CounterPartitionFields({
  counterPartition,
  sequencePadding,
  initialValue,
  readOnly = false,
  onCounterPartitionChange,
  onSequencePaddingChange,
  onInitialValueChange,
}: CounterPartitionFieldsProps) {
  const token = useToken();

  return (
    <Flex vertical gap={16}>
      <div>
        <Typography.Text strong style={{ display: "block", marginBottom: 8 }}>
          Counter partition
        </Typography.Text>
        <Radio.Group
          value={counterPartition}
          disabled={readOnly}
          onChange={(e) => onCounterPartitionChange(e.target.value as CounterPartition)}
          style={{ width: "100%" }}
        >
          <Flex vertical gap={8}>
            {COUNTER_PARTITION_OPTIONS.map((opt) => (
              <Radio
                key={opt.value}
                value={opt.value}
                style={{
                  alignItems: "flex-start",
                  padding: token.paddingSM,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  width: "100%",
                  margin: 0,
                }}
              >
                <Typography.Text strong>{opt.label}</Typography.Text>
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", fontSize: token.fontSizeSM }}
                >
                  {opt.description}
                </Typography.Text>
              </Radio>
            ))}
          </Flex>
        </Radio.Group>
      </div>

      <Flex gap={16} wrap="wrap">
        <div style={{ flex: "1 1 160px" }}>
          <Typography.Text style={{ display: "block", marginBottom: 4 }}>
            Sequence padding
          </Typography.Text>
          <InputNumber
            min={1}
            max={10}
            precision={0}
            disabled={readOnly}
            value={sequencePadding}
            onChange={(val) => onSequencePaddingChange(typeof val === "number" ? val : 6)}
            style={{ width: "100%" }}
          />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Used by {"{seq}"} without a width suffix
          </Typography.Text>
        </div>

        <div style={{ flex: "1 1 160px" }}>
          <Typography.Text style={{ display: "block", marginBottom: 4 }}>
            Initial value
          </Typography.Text>
          <InputNumber
            min={1}
            precision={0}
            disabled={readOnly}
            value={initialValue}
            onChange={(val) => onInitialValueChange(typeof val === "number" ? val : 1)}
            style={{ width: "100%" }}
          />
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            First number issued in each new partition
          </Typography.Text>
        </div>
      </Flex>
    </Flex>
  );
}
