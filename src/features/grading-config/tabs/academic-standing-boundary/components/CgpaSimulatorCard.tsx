import { useToken } from "@/shared/hooks/useToken";
import { Alert, Card, Flex, InputNumber, Tag, Typography } from "antd";
import { useState } from "react";
import { evaluateSimulatedCgpa } from "../utils/cgpaSimulatorEvaluator";
import type { MinimalBoundary } from "../utils/tierIntervalDerivation";

export interface CgpaSimulatorCardProps {
  boundaries: MinimalBoundary[];
  policyMaxCgpa: number;
}

export function CgpaSimulatorCard({
  boundaries,
  policyMaxCgpa,
}: CgpaSimulatorCardProps) {
  const token = useToken();
  const [testCgpa, setTestCgpa] = useState<number | null>(3.5);
  const [testCarryovers, setTestCarryovers] = useState<number | null>(0);

  const evaluation =
    testCgpa != null
      ? evaluateSimulatedCgpa(testCgpa, testCarryovers ?? 0, boundaries, policyMaxCgpa)
      : null;

  return (
    <Card
      variant="outlined"
      style={{
        borderRadius: token.borderRadiusLG,
        borderColor: token.colorBorderSecondary,
        background: token.colorFillQuaternary,
      }}
      styles={{
        body: { padding: token.paddingMD },
      }}
    >
      <Flex vertical gap={12}>
        <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
          <div>
            <Typography.Text strong>⚡ Real-Time Policy Simulator</Typography.Text>
            <Typography.Paragraph type="secondary" style={{ margin: 0, fontSize: token.fontSizeSM }}>
              Test any CGPA and carryover load to verify how the policy engine resolves student academic standing.
            </Typography.Paragraph>
          </div>
        </Flex>

        <Flex gap={16} align="flex-end" wrap="wrap">
          <div>
            <Typography.Text style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
              Test CGPA:
            </Typography.Text>
            <InputNumber
              min={0}
              max={policyMaxCgpa}
              step={0.01}
              precision={2}
              value={testCgpa}
              onChange={(val) => setTestCgpa(val)}
              placeholder="e.g. 2.45"
              style={{ width: 140 }}
            />
          </div>

          <div>
            <Typography.Text style={{ fontSize: 13, display: "block", marginBottom: 4 }}>
              Outstanding Carryovers:
            </Typography.Text>
            <InputNumber
              min={0}
              value={testCarryovers}
              onChange={(val) => setTestCarryovers(val)}
              placeholder="0"
              style={{ width: 160 }}
            />
          </div>

          {/* Simulation Outcome */}
          {evaluation && (
            <Flex align="center" gap={8} wrap="wrap" style={{ flex: 1, minWidth: 260 }}>
              {evaluation.matched && evaluation.effectiveBoundary ? (
                <>
                  <Tag color="blue" style={{ fontSize: 13, padding: "4px 8px" }}>
                    CGPA: {evaluation.roundedCgpa.toFixed(2)}
                  </Tag>
                  <Tag
                    color={
                      evaluation.isOverriddenByCarryover
                        ? "warning"
                        : evaluation.effectiveBoundary.minCgpa >= 2.0
                        ? "success"
                        : "error"
                    }
                    style={{ fontSize: 13, padding: "4px 8px", fontWeight: 600 }}
                  >
                    Result: {evaluation.effectiveBoundary.name}
                  </Tag>
                  {evaluation.effectiveBoundary.studentTransitionStatus && (
                    <Tag color="cyan" style={{ fontSize: 13, padding: "4px 8px" }}>
                      Status: {evaluation.effectiveBoundary.studentTransitionStatus.name}
                    </Tag>
                  )}
                </>
              ) : (
                <Tag color="error" style={{ fontSize: 13, padding: "4px 8px" }}>
                  {evaluation.unmatchedReason}
                </Tag>
              )}
            </Flex>
          )}
        </Flex>

        {/* Carryover Override Notice */}
        {evaluation?.isOverriddenByCarryover && evaluation.carryoverOverrideReason && (
          <Alert
            type="warning"
            showIcon
            title="Carryover Cap Override"
            description={evaluation.carryoverOverrideReason}
          />
        )}
      </Flex>
    </Card>
  );
}
