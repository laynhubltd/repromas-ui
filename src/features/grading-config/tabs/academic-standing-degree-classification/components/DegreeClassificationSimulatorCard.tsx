import { Card, Flex, InputNumber, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import type { DegreeClassificationBandDTO } from "../types/academic-standing-degree-classification";
import { evaluateDegreeClassification } from "../utils/degreeSimulatorEvaluator";

export interface DegreeClassificationSimulatorCardProps {
  bands: DegreeClassificationBandDTO[];
  policyMaxCgpa: number;
  policyName?: string;
}

export function DegreeClassificationSimulatorCard({
  bands,
  policyMaxCgpa,
  policyName = "Selected Policy",
}: DegreeClassificationSimulatorCardProps) {
  const [testCgpa, setTestCgpa] = useState<number | null>(
    bands.length > 0 ? bands[0].minCgpa : 3.5,
  );

  const evaluation = useMemo(() => {
    if (testCgpa === null || isNaN(testCgpa)) return null;
    return evaluateDegreeClassification(
      testCgpa,
      bands,
      policyMaxCgpa,
      policyName,
    );
  }, [testCgpa, bands, policyMaxCgpa, policyName]);

  return (
    <Card
      size="small"
      title={<Typography.Text strong>Interactive Degree Classification Simulator</Typography.Text>}
      styles={{ body: { padding: "14px 16px" } }}
    >
      <Flex wrap="wrap" gap={16} align="center" justify="space-between">
        <Flex align="center" gap={12}>
          <Typography.Text type="secondary" style={{ fontSize: 13 }}>
            Simulate Student CGPA:
          </Typography.Text>
          <InputNumber
            min={0}
            max={policyMaxCgpa}
            step={0.01}
            precision={3}
            value={testCgpa}
            onChange={(val) => setTestCgpa(val)}
            placeholder="e.g. 3.495"
            style={{ width: 140 }}
          />
        </Flex>

        {evaluation && (
          <Flex align="center" gap={12} wrap="wrap">
            <Flex align="center" gap={6}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Evaluated (Rounded 2dp):
              </Typography.Text>
              <Typography.Text strong style={{ fontVariantNumeric: "tabular-nums" }}>
                {evaluation.roundedCgpa.toFixed(2)}
              </Typography.Text>
            </Flex>

            <Flex align="center" gap={6}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Awarded Honor:
              </Typography.Text>
              <Tag
                color={
                  evaluation.isUnclassified
                    ? "error"
                    : evaluation.isFallback
                      ? "default"
                      : "success"
                }
                style={{ fontSize: 13, padding: "2px 8px" }}
              >
                {evaluation.classificationName} ({evaluation.classificationCode})
              </Tag>
            </Flex>

            {evaluation.isFallback && (
              <Tag color="orange">National Benchmark Fallback</Tag>
            )}
            {evaluation.isUnclassified && (
              <Tag color="red">Strict Unclassified (Outside Policy Bands)</Tag>
            )}
          </Flex>
        )}
      </Flex>
      {evaluation?.footnote && (
        <Typography.Paragraph
          type="secondary"
          style={{ fontSize: 11, fontStyle: "italic", margin: "8px 0 0 0" }}
        >
          {evaluation.footnote}
        </Typography.Paragraph>
      )}
    </Card>
  );
}
