import {
  Alert,
  Button,
  Card,
  Collapse,
  Col,
  Flex,
  Form,
  Input,
  Modal,
  Row,
  Table,
  Typography,
} from "antd";
import { useEffect, useState } from "react";
import type {
  ApplyAcademicTransitionsResponse,
  TransitionExecutionRow,
} from "../types/student-transition-evaluation";

export interface TransitionPreviewModalProps {
  open: boolean;
  simulationResult: ApplyAcademicTransitionsResponse | null;
  isApplying: boolean;
  onClose: () => void;
  onCommit: (approvalReference: string) => void;
}

export function TransitionPreviewModal({
  open,
  simulationResult,
  isApplying,
  onClose,
  onCommit,
}: TransitionPreviewModalProps) {
  const [form] = Form.useForm<{ approvalReference: string }>();
  const [approvalRef, setApprovalRef] = useState<string>("");

  useEffect(() => {
    if (open) {
      form.resetFields();
      setApprovalRef("");
    }
  }, [open, form]);

  if (!simulationResult) return null;

  const { summary, skipped, failed } = simulationResult;

  const handleFinish = (values: { approvalReference: string }) => {
    onCommit(values.approvalReference);
  };

  const skippedColumns = [
    {
      title: "Matric Number",
      dataIndex: "matricNumber",
      key: "matricNumber",
      width: 140,
      render: (val: string) => <Typography.Text strong>{val}</Typography.Text>,
    },
    {
      title: "Full Name",
      dataIndex: "fullName",
      key: "fullName",
      width: 180,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 130,
    },
    {
      title: "Reason / Blocker",
      dataIndex: "reason",
      key: "reason",
      render: (val: string | null) => (
        <Typography.Text type="danger" style={{ fontSize: 12 }}>
          {val || "Evaluation deferred / exempt"}
        </Typography.Text>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Flex align="center" gap={8}>
          <span>🏛️</span>
          <span>Senate Academic Transition Simulation & Confirmation</span>
        </Flex>
      }
      open={open}
      onCancel={onClose}
      width={780}
      footer={null}
      destroyOnClose
    >
      <Flex vertical gap={16} style={{ marginTop: 12 }}>
        <Alert
          type="info"
          showIcon
          title="Dry-Run Simulation Complete"
          description="Review the projected impact across the cohort before committing the immutable StudentEnrollmentTransition ledger records. An official Senate Approval Reference is required."
        />

        {/* Summary Metric Cards */}
        <Row gutter={[12, 12]}>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center" }}>
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                Total Requested
              </Typography.Text>
              <Typography.Title level={4} style={{ margin: 0 }}>
                {summary.totalRequested}
              </Typography.Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center", borderColor: "#52c41a" }}>
              <Typography.Text style={{ fontSize: 12, color: "#52c41a" }}>
                Ready to Apply
              </Typography.Text>
              <Typography.Title level={4} style={{ margin: 0, color: "#52c41a" }}>
                {summary.totalCreated}
              </Typography.Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center", borderColor: "#faad14" }}>
              <Typography.Text style={{ fontSize: 12, color: "#faad14" }}>
                Skipped / Deferred
              </Typography.Text>
              <Typography.Title level={4} style={{ margin: 0, color: "#faad14" }}>
                {summary.totalSkipped}
              </Typography.Title>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ textAlign: "center", borderColor: "#ff4d4f" }}>
              <Typography.Text style={{ fontSize: 12, color: "#ff4d4f" }}>
                Validation Errors
              </Typography.Text>
              <Typography.Title level={4} style={{ margin: 0, color: "#ff4d4f" }}>
                {summary.totalFailed}
              </Typography.Title>
            </Card>
          </Col>
        </Row>

        {/* Accordions for Skipped and Failed Rows */}
        {skipped.length > 0 && (
          <Collapse
            items={[
              {
                key: "skipped",
                label: (
                  <Typography.Text strong style={{ color: "#d48806" }}>
                    ⚠️ View {skipped.length} Skipped / Deferred Students with Reasons
                  </Typography.Text>
                ),
                children: (
                  <Table<TransitionExecutionRow>
                    size="small"
                    columns={skippedColumns}
                    dataSource={skipped}
                    rowKey="studentId"
                    pagination={{ pageSize: 5 }}
                  />
                ),
              },
            ]}
          />
        )}

        {failed.length > 0 && (
          <Collapse
            items={[
              {
                key: "failed",
                label: (
                  <Typography.Text strong type="danger">
                    ❌ View {failed.length} Failed Validations
                  </Typography.Text>
                ),
                children: (
                  <Table<TransitionExecutionRow>
                    size="small"
                    columns={skippedColumns}
                    dataSource={failed}
                    rowKey="studentId"
                    pagination={{ pageSize: 5 }}
                  />
                ),
              },
            ]}
          />
        )}

        {/* Commit Form */}
        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            name="approvalReference"
            label="Senate Approval Reference / Resolution Memo Number"
            rules={[
              { required: true, message: "Please provide the official Senate memo reference." },
              { min: 3, message: "Reference must be at least 3 characters." },
            ]}
            extra="Example: SENATE/2026/RES/042 or AB/REG/2026/01. Stamped on all generated transition ledger records."
          >
            <Input
              placeholder="e.g. SENATE/2026/RES/042"
              value={approvalRef}
              onChange={(e) => setApprovalRef(e.target.value)}
            />
          </Form.Item>

          <Flex justify="flex-end" gap={8} style={{ marginTop: 12 }}>
            <Button onClick={onClose} disabled={isApplying}>
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={isApplying}
              disabled={summary.totalCreated === 0}
            >
              Commit Academic Standing Records ({summary.totalCreated})
            </Button>
          </Flex>
        </Form>
      </Flex>
    </Modal>
  );
}
