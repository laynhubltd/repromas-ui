// Feature: student
import type { Program } from "@/features/program/tabs/programs/types/program";
import type { CurriculumVersion } from "@/features/settings/tabs/curriculum-version/types/curriculum-version";
import type { Level } from "@/features/settings/tabs/level-config/types/level";
import {
  ENTRY_MODE_OPTIONS,
  STUDENT_STATUS_OPTIONS,
} from "@/shared/constants/studentOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Alert,
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Typography,
} from "antd";
import { useStudentFormModal } from "../../hooks/useStudentModal";
import type { Student } from "../../types/student";
import {
  emailRules,
  entryModeRules,
  firstNameRules,
  lastNameRules,
  matricNumberRules,
  statusRules,
} from "../../utils/validators";

export type StudentFormModalProps = {
  open: boolean;
  /** null = create mode, Student = edit mode */
  target: Student | null;
  onClose: () => void;
};

/** Reusable required asterisk span. */
function Req() {
  const token = useToken();
  return <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>;
}

export function StudentFormModal({
  open,
  target,
  onClose,
}: StudentFormModalProps) {
  const token = useToken();
  const { state, actions, form, data } = useStudentFormModal(
    target,
    open,
    onClose,
  );
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;
  const {
    programs,
    levels,
    curriculumVersions,
    programName,
    isProgramsLoading,
    isLevelsLoading,
    isCurriculumVersionsLoading,
  } = data;

  return (
    <Modal
      title={isEditMode ? "Edit Student" : "Create Student"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={680}
      destroyOnHidden
      closable
      styles={{
        body: { padding: `${token.paddingSM}px ${token.paddingSM}px` },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div style={{ padding: 24 }}>
        <ErrorAlert variant="form" error={formError} />

        {/* Create mode: warning callout */}
        <ConditionalRenderer when={!isEditMode}>
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="warning"
              showIcon
              message="Matric number cannot be changed after creation"
            />
          </div>
        </ConditionalRenderer>

        {/* Edit mode: read-only context (matric, entry mode, program) */}
        <ConditionalRenderer when={isEditMode}>
          <div
            style={{
              marginBottom: 16,
              padding: "12px 16px",
              background: token.colorBgLayout,
              borderRadius: token.borderRadius,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Row gutter={[16, 8]}>
              <Col xs={24} sm={8}>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM, display: "block" }}
                >
                  Matric Number
                </Typography.Text>
                <Typography.Text strong>{target?.matricNumber}</Typography.Text>
              </Col>
              <Col xs={24} sm={8}>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM, display: "block" }}
                >
                  Entry Mode
                </Typography.Text>
                <Typography.Text strong>{target?.entryMode}</Typography.Text>
              </Col>
              <Col xs={24} sm={8}>
                <Typography.Text
                  type="secondary"
                  style={{ fontSize: token.fontSizeSM, display: "block" }}
                >
                  Program
                </Typography.Text>
                <Typography.Text strong>{programName}</Typography.Text>
              </Col>
            </Row>
          </div>
        </ConditionalRenderer>

        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={handleSubmit}
        >
          {/* ── Create-only: Matric Number (full width) ── */}
          <ConditionalRenderer when={!isEditMode}>
            <Form.Item
              name="matricNumber"
              label={
                <span>
                  Matric Number <Req />
                </span>
              }
              rules={matricNumberRules}
            >
              <Input placeholder="e.g. CSC/2020/001" style={{ height: 40 }} />
            </Form.Item>
          </ConditionalRenderer>

          {/* ── Row 1: First Name + Last Name ── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="firstName"
                label={
                  <span>
                    First Name <Req />
                  </span>
                }
                rules={firstNameRules}
              >
                <Input placeholder="e.g. John" style={{ height: 40 }} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="lastName"
                label={
                  <span>
                    Last Name <Req />
                  </span>
                }
                rules={lastNameRules}
              >
                <Input placeholder="e.g. Doe" style={{ height: 40 }} />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Row 2: Email + Status ── */}
          <Row gutter={16}>
            <Col xs={24} sm={12}>
              <Form.Item name="email" label="Email" rules={emailRules}>
                <Input
                  placeholder="e.g. john.doe@example.com"
                  style={{ height: 40 }}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="status"
                label={
                  <span>
                    Status <Req />
                  </span>
                }
                rules={statusRules}
                initialValue={!isEditMode ? "ACTIVE" : undefined}
              >
                <Select
                  placeholder="Select status"
                  style={{ height: 40 }}
                  options={STUDENT_STATUS_OPTIONS}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Create-only fields ── */}
          <ConditionalRenderer when={!isEditMode}>
            <>
              {/* Row 3: Entry Mode + Program */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="entryMode"
                    label={
                      <span>
                        Entry Mode <Req />
                      </span>
                    }
                    rules={entryModeRules}
                  >
                    <Select
                      placeholder="Select entry mode"
                      style={{ height: 40 }}
                      options={ENTRY_MODE_OPTIONS}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="programId"
                    label={
                      <span>
                        Program <Req />
                      </span>
                    }
                    rules={[{ required: true, message: "Program is required" }]}
                  >
                    <Select
                      placeholder="Select program"
                      loading={isProgramsLoading}
                      showSearch
                      optionFilterProp="label"
                      style={{ height: 40 }}
                      options={programs.map((p: Program) => ({
                        value: p.id,
                        label: p.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              {/* Row 4: Entry Level + Curriculum Version */}
              <Row gutter={16}>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="entryLevelId"
                    label={
                      <span>
                        Entry Level <Req />
                      </span>
                    }
                    rules={[
                      { required: true, message: "Entry level is required" },
                    ]}
                  >
                    <Select
                      placeholder="Select entry level"
                      loading={isLevelsLoading}
                      showSearch
                      optionFilterProp="label"
                      style={{ height: 40 }}
                      options={levels.map((l: Level) => ({
                        value: l.id,
                        label: l.name,
                      }))}
                      onChange={(value) => {
                        form.setFieldValue("currentLevelId", value);
                      }}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item
                    name="curriculumVersionId"
                    label={
                      <span>
                        Curriculum Version <Req />
                      </span>
                    }
                    rules={[
                      {
                        required: true,
                        message: "Curriculum version is required",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Select curriculum version"
                      loading={isCurriculumVersionsLoading}
                      showSearch
                      optionFilterProp="label"
                      style={{ height: 40 }}
                      options={curriculumVersions.map(
                        (v: CurriculumVersion) => ({
                          value: v.id,
                          label: v.name,
                        }),
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </>
          </ConditionalRenderer>

          {/* ── Current Level — full width in edit, half in create (stacks on mobile) ── */}
          <Row gutter={16}>
            <Col xs={24} sm={isEditMode ? 24 : 12}>
              <Form.Item
                name="currentLevelId"
                label={
                  <span>
                    Current Level <Req />
                  </span>
                }
                rules={[
                  { required: true, message: "Current level is required" },
                ]}
              >
                <Select
                  placeholder="Select current level"
                  loading={isLevelsLoading}
                  showSearch
                  optionFilterProp="label"
                  style={{ height: 40 }}
                  options={levels.map((l: Level) => ({
                    value: l.id,
                    label: l.name,
                  }))}
                />
              </Form.Item>
            </Col>
          </Row>

          {/* ── Metadata (full width) ── */}
          <Form.Item
            name="metaData"
            label="Metadata"
            style={{ marginBottom: 0 }}
          >
            <Input.TextArea
              placeholder='e.g. {"key": "value"}'
              rows={3}
              style={{ fontFamily: "monospace" }}
            />
          </Form.Item>
        </Form>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: 24,
          borderTop: `1px solid ${token.colorBorderSecondary}`,
          background: token.colorBgLayout,
        }}
      >
        <Button
          type="primary"
          loading={isLoading}
          disabled={isLoading}
          onClick={() => form.submit()}
          block
          style={{ height: 48, fontWeight: 600 }}
        >
          {isEditMode ? "Save Changes" : "Create Student"}
        </Button>
        <Button
          type="text"
          block
          onClick={handleCancel}
          disabled={isLoading}
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
