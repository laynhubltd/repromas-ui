import type { StudentTransitionStatus } from "@/features/settings/tabs/student-transition-status/types/student-transition-status";
import { useListTransitionsQuery } from "@/features/student/api/studentTransitionsApi";
import type { StudentEnrollmentTransition } from "@/features/student/types/studentTransition";
import { useToken } from "@/shared/hooks/useToken";
import { EditOutlined } from "@ant-design/icons";
import {
  Button,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Flex,
  Form,
  Input,
  Select,
  Spin,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { useUpdateSingleTransitionMutation } from "../api/studentTransitionEvaluationApi";
import type { StudentResultItemDTO } from "../types/student-transition-evaluation";

export interface SingleStudentTransitionDrawerProps {
  open: boolean;
  student: StudentResultItemDTO | null;
  availableStatuses: StudentTransitionStatus[];
  sessionMap: Record<number, string>;
  levelMap: Record<number, string>;
  onClose: () => void;
}

export function SingleStudentTransitionDrawer({
  open,
  student,
  availableStatuses,
  sessionMap,
  levelMap,
  onClose,
}: SingleStudentTransitionDrawerProps) {
  const token = useToken();
  const [updateMutation, { isLoading: isUpdating }] = useUpdateSingleTransitionMutation();

  const [editingTransition, setEditingTransition] = useState<StudentEnrollmentTransition | null>(
    null
  );
  const [form] = Form.useForm();

  const studentId = student?.studentId ?? 0;

  const { data: transitionsData, isLoading: isLoadingLedger } = useListTransitionsQuery(
    {
      "exact[student]": studentId,
      sort: "startDate:desc",
    },
    { skip: !student || !open }
  );

  const ledger = transitionsData?.member ?? [];

  useEffect(() => {
    if (editingTransition) {
      form.setFieldsValue({
        statusId: editingTransition.statusId,
        sessionId: editingTransition.sessionId,
        levelId: editingTransition.levelId,
        startDate: editingTransition.startDate ? dayjs(editingTransition.startDate) : null,
        endDate: editingTransition.endDate ? dayjs(editingTransition.endDate) : null,
        remarks: editingTransition.remarks,
      });
    } else {
      form.resetFields();
    }
  }, [editingTransition, form]);

  const handleStartEdit = (record: StudentEnrollmentTransition) => {
    setEditingTransition(record);
  };

  const handleCancelEdit = () => {
    setEditingTransition(null);
  };

  const handleSaveUpdate = async (values: {
    statusId: number;
    sessionId: number;
    levelId: number;
    startDate: dayjs.Dayjs;
    endDate?: dayjs.Dayjs | null;
    remarks?: string;
  }) => {
    if (!editingTransition) return;

    try {
      await updateMutation({
        id: editingTransition.id,
        statusId: values.statusId,
        sessionId: values.sessionId,
        levelId: values.levelId,
        startDate: values.startDate.format("YYYY-MM-DD"),
        endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : null,
        remarks: values.remarks || null,
      }).unwrap();

      message.success("Transition ledger record updated successfully.");
      setEditingTransition(null);
    } catch (err: unknown) {
      const errMsg =
        typeof err === "object" && err !== null && "data" in err
          ? (err as { data?: { message?: string } }).data?.message || "Update failed."
          : "Failed to update transition record.";
      message.error(errMsg);
    }
  };

  const statusNameMap = Object.fromEntries(availableStatuses.map((s) => [s.id, s.name]));

  const columns = [
    {
      title: "Session & Level",
      key: "sessionLevel",
      render: (_: unknown, r: StudentEnrollmentTransition) => (
        <div>
          <Typography.Text strong>{sessionMap[r.sessionId] || `Session #${r.sessionId}`}</Typography.Text>
          <Typography.Text type="secondary" style={{ display: "block", fontSize: 12 }}>
            {levelMap[r.levelId] || `Level #${r.levelId}`}
          </Typography.Text>
        </div>
      ),
    },
    {
      title: "Standing Status",
      dataIndex: "statusId",
      key: "statusId",
      render: (statusId: number) => (
        <Tag color="blue">{statusNameMap[statusId] || `Status #${statusId}`}</Tag>
      ),
    },
    {
      title: "Effective Dates",
      key: "dates",
      render: (_: unknown, r: StudentEnrollmentTransition) => (
        <Typography.Text style={{ fontSize: 12 }}>
          {r.startDate} {r.endDate ? `→ ${r.endDate}` : "(Active)"}
        </Typography.Text>
      ),
    },
    {
      title: "Remarks",
      dataIndex: "remarks",
      key: "remarks",
      ellipsis: true,
      render: (val: string | null) => (
        <Typography.Text type="secondary" style={{ fontSize: 12 }}>
          {val || "—"}
        </Typography.Text>
      ),
    },
    {
      title: "",
      key: "action",
      width: 60,
      render: (_: unknown, r: StudentEnrollmentTransition) => (
        <Button
          type="text"
          size="small"
          icon={<EditOutlined />}
          onClick={() => handleStartEdit(r)}
        />
      ),
    },
  ];

  return (
    <Drawer
      title="Student Transition & Progression Ledger"
      open={open}
      onClose={() => {
        setEditingTransition(null);
        onClose();
      }}
      width={640}
      destroyOnClose
    >
      {student && (
        <Flex vertical gap={16}>
          <Descriptions size="small" bordered column={2}>
            <Descriptions.Item label="Student Name" span={2}>
              <Typography.Text strong>{student.fullName}</Typography.Text>
            </Descriptions.Item>
            <Descriptions.Item label="Matric Number">
              {student.matricNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Current Standing">
              <Tag color="purple">{student.currentTransition.status || "Unassigned"}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="GPA / CGPA">
              {student.summary.gpa.toFixed(2)} / {student.summary.cgpa.toFixed(2)}
            </Descriptions.Item>
            <Descriptions.Item label="Total Earned Units">
              {student.summary.totalEarnedUnits} Units
            </Descriptions.Item>
          </Descriptions>

          <Divider orientation="start" style={{ margin: "8px 0" }}>
            Historical Enrollment Ledger
          </Divider>

          {isLoadingLedger ? (
            <div style={{ textAlign: "center", padding: 24 }}>
              <Spin description="Loading transition history..." />
            </div>
          ) : (
            <Table
              size="small"
              columns={columns}
              dataSource={ledger}
              rowKey="id"
              pagination={false}
            />
          )}

          {editingTransition && (
            <div
              style={{
                marginTop: 16,
                padding: token.paddingMD,
                borderRadius: token.borderRadiusLG,
                border: `1px solid ${token.colorBorderSecondary}`,
                background: token.colorFillAlter,
              }}
            >
              <Typography.Title level={5} style={{ marginTop: 0 }}>
                Adjust Transition Record #{editingTransition.id}
              </Typography.Title>
              <Form form={form} layout="vertical" onFinish={handleSaveUpdate}>
                <Form.Item
                  name="statusId"
                  label="Transition Status"
                  rules={[{ required: true, message: "Select transition status" }]}
                >
                  <Select
                    options={availableStatuses.map((s) => ({
                      label: s.name,
                      value: s.id,
                    }))}
                  />
                </Form.Item>

                <Form.Item
                  name="startDate"
                  label="Start Date"
                  rules={[{ required: true, message: "Select start date" }]}
                >
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item name="endDate" label="End Date (Optional)">
                  <DatePicker style={{ width: "100%" }} />
                </Form.Item>

                <Form.Item name="remarks" label="Adjustment Memo / Reason">
                  <Input.TextArea rows={2} placeholder="e.g. Corrected pursuant to Academic Board waiver" />
                </Form.Item>

                <Flex justify="flex-end" gap={8}>
                  <Button onClick={handleCancelEdit} disabled={isUpdating}>
                    Cancel
                  </Button>
                  <Button type="primary" htmlType="submit" loading={isUpdating}>
                    Save Adjustment (PUT)
                  </Button>
                </Flex>
              </Form>
            </div>
          )}
        </Flex>
      )}
    </Drawer>
  );
}
