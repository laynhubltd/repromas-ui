// Feature: admission-config — Scoring Strategy Form Modal
// Requirements: 8.2–8.14, 9.2–9.10, 17.2, 18.2, 18.3

import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useToken } from "@/shared/hooks/useToken";
import { SCOPE_OPTIONS, SCREENING_METHOD_OPTIONS } from "@/shared/constants/scoringStrategyOptions";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Alert,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Typography,
} from "antd";
import { useMemo } from "react";
import { useScoringStrategyFormModal } from "../../hooks/useScoringStrategyModal";
import type { AdmissionScoringStrategy } from "../../types/scoring-strategy";
import { resolveReferenceLabel } from "../../utils/resolveReferenceLabel";
import { ScoringStrategyMaxScores } from "../ScoringStrategyMaxScores";
import {
  descriptionRules,
  maxScoreRules,
  weightRules,
} from "../../utils/validators";

type ScoringStrategyFormModalProps = {
  open: boolean;
  target: AdmissionScoringStrategy | null;
  onClose: () => void;
};

export function ScoringStrategyFormModal({
  open,
  target,
  onClose,
}: ScoringStrategyFormModalProps) {
  const token = useToken();
  const isEditMode = target !== null;

  const {
    state: { formError, isSubmitting, isJambOnly },
    actions: { handleSubmit, handleCancel, handleMethodChange, handlePreset },
    form,
  } = useScoringStrategyFormModal(target, open, onClose);

  // Watch scope value to conditionally render reference field and fetch options
  const scopeValue = Form.useWatch("scope", form);
  const maxJambScore = Form.useWatch("max_jamb_score", form);
  const maxSchoolScore = Form.useWatch("max_school_score", form);

  // Fetch reference options based on scope
  const shouldFetchFaculties = open && scopeValue === "FACULTY";
  const shouldFetchDepartments = open && scopeValue === "DEPARTMENT";
  const shouldFetchPrograms = open && scopeValue === "PROGRAM";

  const { data: facultiesData, isLoading: isFacultiesLoading } =
    useGetFacultiesQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchFaculties },
    );

  const { data: departmentsData, isLoading: isDepartmentsLoading } =
    useGetDepartmentsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchDepartments },
    );

  const { data: programsData, isLoading: isProgramsLoading } =
    useGetProgramsQuery(
      { sort: "name:asc", itemsPerPage: 100 },
      { skip: !shouldFetchPrograms },
    );

  // Build reference options based on scope
  const referenceOptionsLocal = useMemo(() => {
    if (scopeValue === "FACULTY") {
      return (facultiesData?.member ?? []).map((f) => ({
        value: f.id,
        label: f.name,
      }));
    }
    if (scopeValue === "DEPARTMENT") {
      return (departmentsData?.member ?? []).map((d) => ({
        value: d.id,
        label: d.name,
      }));
    }
    if (scopeValue === "PROGRAM") {
      return (programsData?.member ?? []).map((p) => ({
        value: p.id,
        label: p.name,
      }));
    }
    return [];
  }, [scopeValue, facultiesData, departmentsData, programsData]);

  const isLoadingRefsLocal =
    isFacultiesLoading || isDepartmentsLoading || isProgramsLoading;

  return (
    <Modal
      title={isEditMode ? "Edit Scoring Strategy" : "Create Scoring Strategy"}
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={640}
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

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          {/* Edit mode: read-only scope and referenceId labels */}
          <ConditionalRenderer when={isEditMode}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  Scope
                </Typography.Text>
                <div style={{ marginTop: 4 }}>
                  <Typography.Text strong>
                    {target?.scope}
                  </Typography.Text>
                </div>
              </div>
              {target?.scope !== "GLOBAL" && (
                <div>
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    Reference
                  </Typography.Text>
                  <div style={{ marginTop: 4 }}>
                    <Typography.Text strong>
                      {target ? resolveReferenceLabel(target) : "—"}
                    </Typography.Text>
                  </div>
                </div>
              )}
            </div>
          </ConditionalRenderer>

          {/* Create mode: scope and reference selects */}
          <ConditionalRenderer when={!isEditMode}>
            {/* Scope */}
            <Form.Item
              name="scope"
              label={
                <span>
                  Scope{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={[{ required: true, message: "Please select a scope" }]}
            >
              <Select
                placeholder="Select scope"
                style={{ height: 40 }}
                options={SCOPE_OPTIONS}
              />
            </Form.Item>

            {/* Reference — conditional on scope */}
            <ConditionalRenderer when={scopeValue && scopeValue !== "GLOBAL"}>
              <Form.Item
                name="referenceId"
                label={
                  <span>
                    Reference{" "}
                    <span style={{ color: token.colorError, fontWeight: 700 }}>
                      *
                    </span>
                  </span>
                }
                rules={[
                  {
                    required: true,
                    message: "Please select a reference",
                  },
                ]}
              >
                <Select
                  placeholder="Select reference"
                  style={{ height: 40 }}
                  loading={isLoadingRefsLocal}
                  options={referenceOptionsLocal}
                />
              </Form.Item>
            </ConditionalRenderer>
          </ConditionalRenderer>

          {/* Preset buttons row */}
          <div
            style={{
              display: "flex",
              gap: 12,
              marginBottom: 24,
              paddingBottom: 24,
              borderBottom: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Button
              type="default"
              onClick={() => handlePreset("jamb-only")}
              style={{ flex: 1 }}
            >
              JAMB Only
            </Button>
            <Button
              type="default"
              onClick={() => handlePreset("olevel-5050")}
              style={{ flex: 1 }}
            >
              50/50 O'Level
            </Button>
            <Button
              type="default"
              onClick={() => handlePreset("post-utme-5050")}
              style={{ flex: 1 }}
            >
              50/50 Post-UTME
            </Button>
          </div>

          {/* Screening Method */}
          <Form.Item
            name="screening_method"
            label={
              <span>
                Screening Method{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={[
              { required: true, message: "Please select a screening method" },
            ]}
          >
            <Select
              placeholder="Select screening method"
              style={{ height: 40 }}
              onChange={handleMethodChange}
              options={SCREENING_METHOD_OPTIONS.map((opt) => ({
                value: opt.value,
                label: (
                  <div>
                    <div style={{ fontWeight: 500 }}>{opt.label}</div>
                    <div
                      style={{
                        fontSize: token.fontSizeSM,
                        color: token.colorTextSecondary,
                      }}
                    >
                      {opt.description}
                    </div>
                  </div>
                ),
              }))}
            />
          </Form.Item>

          {/* Edit mode warning */}
          <ConditionalRenderer when={isEditMode}>
            <Alert
              type="warning"
              message="Changing the screening method mid-cycle is disruptive and only affects future scoring runs."
              style={{ marginBottom: 24 }}
              showIcon
            />
          </ConditionalRenderer>

          {/* JAMB Weight % */}
          <Form.Item
            name="jamb_weight_percentage"
            label={
              <span>
                JAMB Weight %{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={weightRules}
          >
            <InputNumber
              min={0}
              max={100}
              disabled={isJambOnly}
              style={{ width: "100%", height: 40 }}
              placeholder="0"
            />
          </Form.Item>

          {/* School Weight % */}
          <Form.Item
            name="school_weight_percentage"
            label={
              <span>
                School Weight %{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={weightRules}
          >
            <InputNumber
              min={0}
              max={100}
              disabled={isJambOnly}
              style={{ width: "100%", height: 40 }}
              placeholder="0"
            />
          </Form.Item>

          {/* Max JAMB Score */}
          <Form.Item
            name="max_jamb_score"
            label={
              <span>
                Max JAMB Score{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={maxScoreRules}
          >
            <InputNumber
              min={1}
              style={{ width: "100%", height: 40 }}
              placeholder="400"
            />
          </Form.Item>

          {/* Max School Score */}
          <Form.Item
            name="max_school_score"
            label={
              <span>
                Max School Score{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            rules={maxScoreRules}
          >
            <InputNumber
              min={1}
              style={{ width: "100%", height: 40 }}
              placeholder="100"
            />
          </Form.Item>

          <ConditionalRenderer
            when={
              typeof maxJambScore === "number" &&
              typeof maxSchoolScore === "number" &&
              maxJambScore > 0 &&
              maxSchoolScore > 0
            }
          >
            <div style={{ marginBottom: 24 }}>
              <ScoringStrategyMaxScores
                maxJambScore={maxJambScore}
                maxSchoolScore={maxSchoolScore}
                variant="expanded"
              />
            </div>
          </ConditionalRenderer>

          {/* Description */}
          <Form.Item
            name="description"
            label="Description"
            rules={descriptionRules}
          >
            <Input.TextArea
              placeholder="Optional description (max 255 characters)"
              rows={3}
              maxLength={255}
              showCount
            />
          </Form.Item>
        </Form>
      </div>

      {/* Footer */}
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
        <PermissionGuard
          permission={
            isEditMode
              ? Permission.AdmissionScoringStrategiesUpdate
              : Permission.AdmissionScoringStrategiesCreate
          }
        >
          <Button
            type="primary"
            loading={isSubmitting}
            disabled={isSubmitting}
            onClick={() => form.submit()}
            block
            style={{ height: 48, fontWeight: 600 }}
          >
            {isEditMode ? "Save Changes" : "Create Strategy"}
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
