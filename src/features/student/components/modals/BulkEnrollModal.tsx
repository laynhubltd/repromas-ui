// Feature: student-transition
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Button,
  Collapse,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Table,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useBulkEnrollModal } from "../../hooks/useBulkEnrollModal";
import type { Student } from "../../types/student";
import {
  endDateRules,
  levelIdRules,
  semesterIdRules,
  sessionIdRules,
  startDateRules,
  statusIdRules,
} from "../../utils/transitionValidators";

export type BulkEnrollModalProps = {
  open: boolean;
  onClose: () => void;
};

export function BulkEnrollModal({ open, onClose }: BulkEnrollModalProps) {
  const token = useToken();
  const { state, actions, form, refs } = useBulkEnrollModal(open, onClose);

  const {
    students,
    totalStudents,
    studentsLoading,
    studentSearch,
    studentPage,
    selectedStudentIds,
    formError,
    isSubmitting,
    result,
    selectedLevelId,
  } = state;

  const {
    handleStudentSearchChange,
    handleStudentPageChange,
    handleSelectionChange,
    handleSessionChange,
    handleLevelChange,
    handleSubmit,
    handleRetryFailed,
    handleCancel,
  } = actions;

  const {
    statuses,
    sessions,
    semesters,
    levels,
    sessionsLoading,
    semestersLoading,
    levelsLoading,
  } = refs;

  // ── Student table columns ──────────────────────────────────────────────────

  const studentColumns: ColumnsType<Student> = [
    {
      title: "Name",
      key: "name",
      render: (_, record) => `${record.firstName} ${record.lastName}`,
    },
    {
      title: "Matric Number",
      dataIndex: "matricNumber",
      key: "matricNumber",
    },
  ];

  // ── Failed table columns ───────────────────────────────────────────────────

  const failedColumns: ColumnsType<{ studentId: string; reason: string }> = [
    { title: "Student ID", dataIndex: "studentId", key: "studentId" },
    { title: "Reason", dataIndex: "reason", key: "reason" },
  ];

  const failedRows = result
    ? Object.entries(result.failed).map(([studentId, reason]) => ({
        studentId,
        reason,
      }))
    : [];

  const skippedRows = result
    ? Object.entries(result.skipped).map(([studentId, reason]) => ({
        studentId,
        reason,
      }))
    : [];

  return (
    <Modal
      title="Bulk Student Transition"
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={760}
      destroyOnHidden
      closable
      styles={{
        body: { padding: 0 },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingMD}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: `${token.paddingMD}px` }}>
        {/* Error alert for 422 / 400 */}
        <ConditionalRenderer when={!!formError}>
          <ErrorAlert variant="form" error={formError} />
        </ConditionalRenderer>

        {/* Result summary banner after 201 */}
        <ConditionalRenderer when={!!result}>
          <div
            style={{
              background: token.colorSuccessBg,
              border: `1px solid ${token.colorSuccessBorder}`,
              borderRadius: token.borderRadius,
              padding: `${token.paddingSM}px ${token.paddingMD}px`,
              marginBottom: token.marginMD,
            }}
          >
            <Typography.Text strong style={{ color: token.colorSuccess }}>
              Created {result?.summary.totalCreated} transitions. Skipped{" "}
              {result?.summary.totalSkipped}. Failed{" "}
              {result?.summary.totalFailed}.
            </Typography.Text>
          </div>

          {/* Failed table + Retry Failed button */}
          <ConditionalRenderer when={(result?.summary.totalFailed ?? 0) > 0}>
            <div style={{ marginBottom: token.marginMD }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: token.marginXS,
                }}
              >
                <Typography.Text strong style={{ color: token.colorError }}>
                  Failed ({result?.summary.totalFailed})
                </Typography.Text>
                <Button size="small" onClick={handleRetryFailed}>
                  Retry Failed
                </Button>
              </div>
              <Table
                size="small"
                columns={failedColumns}
                dataSource={failedRows}
                rowKey="studentId"
                pagination={false}
              />
            </div>
          </ConditionalRenderer>

          {/* Skipped collapsible */}
          <ConditionalRenderer when={(result?.summary.totalSkipped ?? 0) > 0}>
            <Collapse
              size="small"
              style={{ marginBottom: token.marginMD }}
              items={[
                {
                  key: "skipped",
                  label: (
                    <Typography.Text type="secondary">
                      Skipped ({result?.summary.totalSkipped}) — These students
                      were already enrolled for the selected semester.
                    </Typography.Text>
                  ),
                  children: (
                    <Table
                      size="small"
                      columns={[
                        {
                          title: "Student ID",
                          dataIndex: "studentId",
                          key: "studentId",
                        },
                        { title: "Reason", dataIndex: "reason", key: "reason" },
                      ]}
                      dataSource={skippedRows}
                      rowKey="studentId"
                      pagination={false}
                    />
                  ),
                },
              ]}
            />
          </ConditionalRenderer>
        </ConditionalRenderer>

        {/* Transition form fields */}
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: `0 ${token.marginMD}px`,
            }}
          >
            {/* statusId */}
            <Form.Item name="statusId" label="Status" rules={statusIdRules}>
              <Select
                placeholder="Select status"
                showSearch
                style={{ height: 40 }}
                options={statuses.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>

            {/* levelId */}
            <Form.Item name="levelId" label="Level" rules={levelIdRules}>
              <Select
                placeholder="Select level"
                loading={levelsLoading}
                disabled={levelsLoading}
                showSearch
                style={{ height: 40 }}
                options={levels.map((l) => ({ value: l.id, label: l.name }))}
                onChange={(value) =>
                  handleLevelChange(value as number | undefined)
                }
              />
            </Form.Item>

            {/* sessionId */}
            <Form.Item name="sessionId" label="Session" rules={sessionIdRules}>
              <Select
                placeholder="Select session"
                loading={sessionsLoading}
                disabled={sessionsLoading}
                showSearch
                style={{ height: 40 }}
                options={sessions.map((s) => ({
                  value: s.id,
                  label: s.name,
                  isCurrent: s.isCurrent,
                }))}
                optionRender={(option) => (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 8 }}
                  >
                    {option.data.label}
                    {option.data.isCurrent && (
                      <Tag color="green" style={{ margin: 0, fontSize: 11 }}>
                        Current
                      </Tag>
                    )}
                  </span>
                )}
                onChange={(value) =>
                  handleSessionChange(value as number | undefined)
                }
              />
            </Form.Item>

            {/* semesterId */}
            <Form.Item
              name="semesterId"
              label="Semester"
              rules={semesterIdRules}
            >
              <Select
                placeholder="Select semester"
                loading={semestersLoading}
                disabled={semestersLoading || !form.getFieldValue("sessionId")}
                showSearch
                style={{ height: 40 }}
                options={semesters.map((s) => ({ value: s.id, label: s.name }))}
              />
            </Form.Item>

            {/* startDate */}
            <Form.Item
              name="startDate"
              label="Start Date"
              rules={startDateRules}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : undefined,
              })}
              getValueFromEvent={(date) =>
                date ? date.format("YYYY-MM-DD") : undefined
              }
            >
              <DatePicker style={{ width: "100%", height: 40 }} />
            </Form.Item>

            {/* endDate */}
            <Form.Item
              name="endDate"
              label="End Date"
              rules={endDateRules}
              getValueProps={(value) => ({
                value: value ? dayjs(value) : undefined,
              })}
              getValueFromEvent={(date) =>
                date ? date.format("YYYY-MM-DD") : undefined
              }
            >
              <DatePicker style={{ width: "100%", height: 40 }} />
            </Form.Item>
          </div>

          {/* remarks */}
          <Form.Item name="remarks" label="Remarks">
            <Input.TextArea placeholder="Optional remarks..." rows={2} />
          </Form.Item>
        </Form>

        {/* Student search + table — only shown after a level is selected */}
        <ConditionalRenderer when={!selectedLevelId}>
          <div
            style={{
              padding: `${token.paddingMD}px`,
              textAlign: "center",
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgLayout,
            }}
          >
            <Typography.Text type="secondary">
              Select a level above to load students.
            </Typography.Text>
          </div>
        </ConditionalRenderer>

        <ConditionalRenderer when={!!selectedLevelId}>
          {/* Matric number search */}
          <div style={{ marginBottom: token.marginSM }}>
            <Input.Search
              placeholder="Search by matric number…"
              value={studentSearch}
              onChange={(e) => handleStudentSearchChange(e.target.value)}
              allowClear
              style={{ maxWidth: 360 }}
            />
          </div>

          {/* Student selection table */}
          <Table<Student>
            size="small"
            columns={studentColumns}
            dataSource={students}
            rowKey="id"
            loading={studentsLoading}
            rowSelection={{
              type: "checkbox",
              selectedRowKeys: selectedStudentIds,
              onChange: (keys) => handleSelectionChange(keys as number[]),
            }}
            pagination={{
              current: studentPage,
              pageSize: 100,
              total: totalStudents,
              onChange: handleStudentPageChange,
              showSizeChanger: false,
              showTotal: (total) => `${total} students`,
            }}
            scroll={{ y: 280 }}
          />
        </ConditionalRenderer>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: `${token.paddingMD}px`,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <PermissionGuard
          permission={Permission.StudentEnrollmentTransitionsCreate}
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting || selectedStudentIds.length === 0}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            Enroll Selected ({selectedStudentIds.length})
          </Button>
        </PermissionGuard>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isSubmitting}
          style={{
            height: 40,
            color: token.colorTextSecondary,
            fontWeight: 500,
            fontSize: token.fontSizeSM,
          }}
        >
          Cancel
        </Button>
      </div>
    </Modal>
  );
}
