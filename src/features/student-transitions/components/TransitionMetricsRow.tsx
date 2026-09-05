import { DashCard } from "@/components/ui-kit";
import { Button, Col, Flex, Popover, Row, Table, Typography } from "antd";
import type { StagedOverride } from "../types/student-transition-evaluation";

export interface TransitionMetricsRowProps {
  totalEvaluated: number;
  actionableCount: number;
  deferredCount: number;
  stagedOverrides: Record<number, StagedOverride>;
  isLoading: boolean;
  onClearOverrides: () => void;
  onRemoveOverride: (studentId: number) => void;
}

export function TransitionMetricsRow({
  totalEvaluated,
  actionableCount,
  deferredCount,
  stagedOverrides,
  isLoading,
  onClearOverrides,
  onRemoveOverride,
}: TransitionMetricsRowProps) {
  const stagedList = Object.values(stagedOverrides);
  const stagedCount = stagedList.length;
  const cardState = isLoading ? "loading" : "default";

  const popoverContent = (
    <div style={{ maxWidth: 420 }}>
      {stagedCount === 0 ? (
        <Typography.Text type="secondary">No manual overrides staged.</Typography.Text>
      ) : (
        <Flex vertical gap={8}>
          <Table
            size="small"
            pagination={false}
            dataSource={stagedList}
            rowKey="studentId"
            columns={[
              {
                title: "Student",
                render: (_, r) => (
                  <div>
                    <Typography.Text strong style={{ display: "block" }}>
                      {r.fullName}
                    </Typography.Text>
                    <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                      {r.matricNumber}
                    </Typography.Text>
                  </div>
                ),
              },
              {
                title: "Target Override",
                dataIndex: "targetStatusName",
                render: (val) => <Typography.Text strong>{val}</Typography.Text>,
              },
              {
                title: "",
                render: (_, r) => (
                  <Button
                    type="link"
                    danger
                    size="small"
                    onClick={() => onRemoveOverride(r.studentId)}
                  >
                    Clear
                  </Button>
                ),
              },
            ]}
          />
          <Button size="small" danger onClick={onClearOverrides}>
            Clear All Overrides
          </Button>
        </Flex>
      )}
    </div>
  );

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={6}>
        <DashCard
          title="Total Evaluated"
          value={totalEvaluated}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <DashCard
          title="Actionable"
          value={actionableCount}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <DashCard
          title="Deferred / Skipped"
          value={deferredCount}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
      <Col xs={24} sm={12} md={6}>
        <Popover
          content={popoverContent}
          title={`Staged Overrides (${stagedCount})`}
          trigger="hover"
          placement="bottomRight"
        >
          <div style={{ cursor: "pointer" }}>
            <DashCard
              title="Overrides Staged"
              value={stagedCount}
              state={cardState}
              size="md"
              density="comfortable"
            />
          </div>
        </Popover>
      </Col>
    </Row>
  );
}
