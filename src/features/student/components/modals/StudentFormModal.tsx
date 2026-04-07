// Feature: student
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import { useGetLevelsQuery } from "@/features/settings/tabs/level-config/api/levelApi";
import { useToken } from "@/shared/hooks/useToken";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { Alert, Button, Form, Input, Modal, Select, Typography } from "antd";
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

const ENTRY_MODE_OPTIONS = [
  { value: "UTME", label: "UTME" },
  { value: "DIRECT_ENTRY", label: "Direct Entry" },
  { value: "TRANSFER", label: "Transfer" },
];

const STATUS_OPTIONS = [
  { value: "ACTIVE", label: "Active" },
  { value: "SUSPENDED", label: "Suspended" },
  { value: "GRADUATED", label: "Graduated" },
  { value: "WITHDRAWN", label: "Withdrawn" },
  { value: "RUSTICATED", label: "Rusticated" },
];

export function StudentFormModal({ open, target, onClose }: StudentFormModalProps) {
  const token = useToken();
  const { state, actions, form } = useStudentFormModal(target, open, onClose);
  const { formError, isLoading, isEditMode } = state;
  const { handleSubmit, handleCancel } = actions;

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    itemsPerPage: 200,
  });
  const programs = programsData?.member ?? [];

  const { data: levelsData, isLoading: isLevelsLoading } = useGetLevelsQuery({
    itemsPerPage: 200,
  });
  const levels = levelsData?.member ?? [];

  const { data: curriculumVersionsData, isLoading: isCurriculumVersionsLoading } =
    useGetCurriculumVersionsQuery({ itemsPerPage: 200 });
  const curriculumVersions = curriculumVersionsData?.member ?? [];

  const programName =
    programs.find((p) => p.id === target?.programId)?.name ?? `Program #${target?.programId}`;

  return (
    <Modal
      title={isEditMode ? "Edit Student" : "Create Student"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={isEditMode ? 520 : 600}
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
        {!isEditMode && (
          <div style={{ marginBottom: 16 }}>
            <Alert
              type="warning"
              showIcon
              message="Matric number cannot be changed after creation"
            />
          </div>
        )}

        {/* Edit mode: read-only context display */}
        {isEditMode && (
          <div style={{ marginBottom: 16 }}>
            <Form layout="vertical" requiredMark={false}>
              <Form.Item label="Matric Number" style={{ marginBottom: 8 }}>
                <Typography.Text>{target?.matricNumber}</Typography.Text>
              </Form.Item>
              <Form.Item label="Entry Mode" style={{ marginBottom: 8 }}>
                <Typography.Text>{target?.entryMode}</Typography.Text>
              </Form.Item>
              <Form.Item label="Program" style={{ marginBottom: 8 }}>
                <Typography.Text>{programName}</Typography.Text>
              </Form.Item>
            </Form>
          </div>
        )}

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* Create-only fields */}
          {!isEditMode && (
            <Form.Item
              name="matricNumber"
              label={
                <span>
                  Matric Number{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={matricNumberRules}
            >
              <Input placeholder="e.g. CSC/2020/001" style={{ height: 40 }} />
            </Form.Item>
          )}

          <Form.Item
            name="firstName"
            label={
              <span>
                First Name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={firstNameRules}
          >
            <Input placeholder="e.g. John" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="lastName"
            label={
              <span>
                Last Name{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={lastNameRules}
          >
            <Input placeholder="e.g. Doe" style={{ height: 40 }} />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={emailRules}
          >
            <Input placeholder="e.g. john.doe@example.com" style={{ height: 40 }} />
          </Form.Item>

          {/* Create-only fields */}
          {!isEditMode && (
            <>
              <Form.Item
                name="entryMode"
                label={
                  <span>
                    Entry Mode{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
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

              <Form.Item
                name="programId"
                label={
                  <span>
                    Program{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
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
                  options={programs.map((p) => ({ value: p.id, label: p.name }))}
                />
              </Form.Item>

              <Form.Item
                name="entryLevelId"
                label={
                  <span>
                    Entry Level{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                  </span>
                }
                rules={[{ required: true, message: "Entry level is required" }]}
              >
                <Select
                  placeholder="Select entry level"
                  loading={isLevelsLoading}
                  showSearch
                  optionFilterProp="label"
                  style={{ height: 40 }}
                  options={levels.map((l) => ({ value: l.id, label: l.name }))}
                  onChange={(value) => {
                    // Pre-fill currentLevelId from entryLevelId
                    form.setFieldValue("currentLevelId", value);
                  }}
                />
              </Form.Item>
            </>
          )}

          <Form.Item
            name="currentLevelId"
            label={
              <span>
                Current Level{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={[{ required: true, message: "Current level is required" }]}
          >
            <Select
              placeholder="Select current level"
              loading={isLevelsLoading}
              showSearch
              optionFilterProp="label"
              style={{ height: 40 }}
              options={levels.map((l) => ({ value: l.id, label: l.name }))}
            />
          </Form.Item>

          {/* Create-only fields */}
          {!isEditMode && (
            <Form.Item
              name="curriculumVersionId"
              label={
                <span>
                  Curriculum Version{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
                </span>
              }
              rules={[{ required: true, message: "Curriculum version is required" }]}
            >
              <Select
                placeholder="Select curriculum version"
                loading={isCurriculumVersionsLoading}
                showSearch
                optionFilterProp="label"
                style={{ height: 40 }}
                options={curriculumVersions.map((v) => ({ value: v.id, label: v.name }))}
              />
            </Form.Item>
          )}

          <Form.Item
            name="status"
            label={
              <span>
                Status{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>*</span>
              </span>
            }
            rules={statusRules}
            initialValue={!isEditMode ? "ACTIVE" : undefined}
          >
            <Select
              placeholder="Select status"
              style={{ height: 40 }}
              options={STATUS_OPTIONS}
            />
          </Form.Item>

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
