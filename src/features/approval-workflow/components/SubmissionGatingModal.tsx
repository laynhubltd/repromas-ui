// Feature: approval-workflow — Submission Gating Modal
import { useToken } from "@/shared/hooks/useToken";
import { AlertOutlined, EditOutlined, ExclamationCircleFilled } from "@ant-design/icons";
import { Alert, Button, Modal, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { IncompleteStudentOutcome } from "../utils/parseSubmissionPrecondition";

type SubmissionGatingModalProps = {
  open: boolean;
  students: IncompleteStudentOutcome[];
  onClose: () => void;
  onFocusStudent?: (matricNumber: string) => void;
};

export function SubmissionGatingModal({
  open,
  students = [],
  onClose,
  onFocusStudent,
}: SubmissionGatingModalProps) {
  const token = useToken();

  const columns: ColumnsType<IncompleteStudentOutcome> = [
    {
      title: "Matric / Reg No",
      dataIndex: "matricNumber",
      key: "matricNumber",
      width: 140,
      render: (val: string) => (
        <Typography.Text strong style={{ fontFamily: "monospace" }}>
          {val}
        </Typography.Text>
      ),
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
      render: (val: string) => (
        <Typography.Text>{val}</Typography.Text>
      ),
    },
    {
      title: "Status / Reason",
      dataIndex: "reason",
      key: "reason",
      render: (val: string) => (
        <Tag color="orange" icon={<ExclamationCircleFilled />} style={{ margin: 0 }}>
          {val}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      align: "right",
      width: 130,
      render: (_: unknown, record: IncompleteStudentOutcome) => (
        <Button
          type="link"
          size="small"
          icon={<EditOutlined />}
          onClick={() => {
            onClose();
            if (onFocusStudent) {
              onFocusStudent(record.matricNumber);
            }
          }}
        >
          Resolve
        </Button>
      ),
    },
  ];

  return (
    <Modal
      title={
        <Space align="center" size={8}>
          <AlertOutlined style={{ color: token.colorWarning, fontSize: 18 }} />
          <span>Workflow Submission Blocked</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={[
        <Button key="close" type="primary" onClick={onClose}>
          Got it, I'll update scores
        </Button>,
      ]}
      width={680}
      destroyOnHidden
    >
      <div style={{ marginTop: 12 }}>
        <Alert
          type="warning"
          showIcon
          message="Unrecorded or Incomplete Student Outcomes"
          description={`Cannot submit score sheet: ${students.length} student(s) have unrecorded or incomplete scores. Please enter missing numeric component scores or assign an administrative status (e.g. Absent, Incomplete, Excused).`}
          style={{ marginBottom: 16 }}
        />

        <Table<IncompleteStudentOutcome>
          rowKey="matricNumber"
          columns={columns}
          dataSource={students}
          pagination={false}
          size="small"
          scroll={{ y: 260 }}
          bordered
        />
      </div>
    </Modal>
  );
}
