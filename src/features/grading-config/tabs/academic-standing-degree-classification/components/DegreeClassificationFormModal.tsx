import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Checkbox, Col, Form, Input, InputNumber, Modal, Row, Typography } from "antd";
import { useDegreeClassificationForm } from "../hooks/useDegreeClassificationForm";
import type { DegreeClassificationBand } from "../types/academic-standing-degree-classification";

export interface DegreeClassificationFormModalProps {
  open: boolean;
  academicStandingId: number;
  policyMaxCgpa: number;
  target: DegreeClassificationBand | null;
  onClose: () => void;
  onSuccess: () => void;
}

export function DegreeClassificationFormModal({
  open,
  academicStandingId,
  policyMaxCgpa,
  target,
  onClose,
  onSuccess,
}: DegreeClassificationFormModalProps) {
  const {
    form,
    isEditing,
    isOpenCeiling,
    isSubmitting,
    formError,
    handleOpenCeilingChange,
    handleSubmit,
  } = useDegreeClassificationForm({
    academicStandingId,
    policyMaxCgpa,
    target,
    open,
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  return (
    <Modal
      open={open}
      title={isEditing ? "Edit Degree Classification Band" : "Add Degree Classification Band"}
      okText={isEditing ? "Save Changes" : "Create Band"}
      confirmLoading={isSubmitting}
      onCancel={onClose}
      onOk={() => form.submit()}
      destroyOnHidden
      width={560}
    >
      <ErrorAlert error={formError} variant="form" />

      <Typography.Paragraph type="secondary" style={{ fontSize: 13, marginBottom: 16 }}>
        Configure the honor tier, identifier code, and qualifying CGPA range. The scale ceiling is bounded by the parent policy's max CGPA (<strong>{policyMaxCgpa.toFixed(2)}</strong>).
      </Typography.Paragraph>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={{
          rankOrder: 1,
          minCgpa: 3.5,
          maxCgpa: policyMaxCgpa,
          isOpenCeiling: false,
        }}
      >
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Classification Name"
              rules={[
                { required: true, message: "Please enter a classification name." },
                { max: 100, message: "Name cannot exceed 100 characters." },
              ]}
            >
              <Input placeholder="e.g. First Class, Distinction, Upper Credit" />
            </Form.Item>
          </Col>

          <Col span={8}>
            <Form.Item
              name="code"
              label="Code"
              rules={[
                { required: true, message: "Please enter a code." },
                { max: 20, message: "Code cannot exceed 20 characters." },
              ]}
            >
              <Input placeholder="e.g. 1ST, DIST" style={{ textTransform: "uppercase" }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16} align="bottom">
          <Col span={10}>
            <Form.Item
              name="minCgpa"
              label="Minimum CGPA"
              rules={[
                { required: true, message: "Please enter minimum CGPA." },
                {
                  type: "number",
                  min: 0,
                  max: policyMaxCgpa,
                  message: `Must be between 0.00 and ${policyMaxCgpa.toFixed(2)}.`,
                },
              ]}
            >
              <InputNumber
                min={0}
                max={policyMaxCgpa}
                step={0.01}
                precision={2}
                style={{ width: "100%" }}
                placeholder="e.g. 3.50"
              />
            </Form.Item>
          </Col>

          <Col span={10}>
            <Form.Item
              name="maxCgpa"
              label="Maximum CGPA"
              rules={[
                {
                  validator: async (_, value) => {
                    if (isOpenCeiling) return Promise.resolve();
                    if (value === undefined || value === null) {
                      return Promise.reject(new Error("Please enter maximum CGPA or select open ceiling."));
                    }
                    if (value > policyMaxCgpa) {
                      return Promise.reject(new Error(`Cannot exceed policy scale (${policyMaxCgpa.toFixed(2)}).`));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                min={0}
                max={policyMaxCgpa}
                step={0.01}
                precision={2}
                disabled={isOpenCeiling}
                style={{ width: "100%" }}
                placeholder={isOpenCeiling ? "Uncapped" : "e.g. 4.00"}
              />
            </Form.Item>
          </Col>

          <Col span={4}>
            <Form.Item style={{ marginBottom: 24 }}>
              <Checkbox
                checked={isOpenCeiling}
                onChange={(e) => handleOpenCeilingChange(e.target.checked)}
              >
                No Cap
              </Checkbox>
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="rankOrder"
              label="Rank Order (1 = Highest Honor)"
              rules={[
                { required: true, message: "Please specify rank order." },
                { type: "number", min: 1, message: "Rank must be at least 1." },
              ]}
              extra="Must be unique among bands for this policy."
            >
              <InputNumber min={1} max={99} step={1} style={{ width: "100%" }} />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
}
