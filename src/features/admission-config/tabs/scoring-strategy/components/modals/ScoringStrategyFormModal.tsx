// Feature: admission-config — Scoring Strategy Form Modal
// Requirements: 8.2–8.14, 9.2–9.10, 17.2, 18.2, 18.3

import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useGetDepartmentsQuery } from "@/features/academic-structure/api/departmentsApi";
import { useGetFacultiesQuery } from "@/features/academic-structure/api/facultiesApi";
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import {
  getLaneProfileLabel,
  LANE_PROFILE_OPTIONS,
  OPEN_UTME_RENORMALIZE_HELPER,
  PRIOR_QUAL_STUB_WARNING,
  SCOPE_OPTIONS,
} from "@/shared/constants/scoringStrategyOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Grid,
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
import {
  getMaxSchoolScoreExtra,
  getMaxSchoolScoreLabel,
  getMaxSchoolScorePlaceholder,
  methodIncludesPriorQual,
  resolveLaneProfileFromStrategy,
} from "../../utils/scoringStrategyDisplay";
import {
  descriptionRules,
  laneProfileRules,
  maxScoreRules,
  weightRules,
} from "../../utils/validators";
import { ScoringComponentsBuilder } from "../ScoringComponentsBuilder";
import { ScoringMethodField } from "../ScoringMethodField";
import { ScoringStrategyLaneSummary } from "../ScoringStrategyLaneSummary";
import { ScoringStrategyMaxScores } from "../ScoringStrategyMaxScores";
import { ScoringStrategyPresetsPanel } from "../ScoringStrategyPresetsPanel";

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
  const screens = Grid.useBreakpoint();
  const isCompact = !screens.md;
  const isEditMode = target !== null;

  const {
    state: {
      formError,
      isSubmitting,
      isJambOnly,
      isMixed,
      isJambWeightsVisible,
      showRequiresJambToggle,
      showSchoolOnlyPreview,
      showRenormalizeHelper,
      laneProfile,
      screeningMethod,
      requiresJamb,
    },
    actions: {
      handleSubmit,
      handleCancel,
      handleMethodChange,
      handlePreset,
      handleLaneChange,
      initializeForm,
    },
    form,
  } = useScoringStrategyFormModal(target, open, onClose);

  const scopeValue = Form.useWatch("scope", form);
  const maxJambScore = Form.useWatch("max_jamb_score", form);
  const maxSchoolScore = Form.useWatch("max_school_score", form);
  const jambWeight = Form.useWatch("jamb_weight_percentage", form);
  const schoolWeight = Form.useWatch("school_weight_percentage", form);
  const components = Form.useWatch("components", form);

  const strategyPreview = useMemo(
    () => ({
      screening_method: screeningMethod,
      jamb_weight_percentage: jambWeight,
      school_weight_percentage: schoolWeight,
      max_jamb_score: maxJambScore,
      max_school_score: maxSchoolScore,
      requires_jamb: requiresJamb,
      components,
    }),
    [
      screeningMethod,
      jambWeight,
      schoolWeight,
      maxJambScore,
      maxSchoolScore,
      requiresJamb,
      components,
    ],
  );

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

  const maxSchoolScoreLabel = screeningMethod
    ? getMaxSchoolScoreLabel(screeningMethod)
    : "Max School Score";

  const maxSchoolScorePlaceholder = screeningMethod
    ? getMaxSchoolScorePlaceholder(screeningMethod)
    : "100";

  const maxSchoolScoreExtra = getMaxSchoolScoreExtra(
    screeningMethod,
    maxSchoolScore,
  );

  const showPriorQualWarning =
    screeningMethod && methodIncludesPriorQual(screeningMethod);

  const editLaneLabel = target
    ? getLaneProfileLabel(resolveLaneProfileFromStrategy(target))
    : "";

  return (
    <Modal
      title={isEditMode ? "Edit Scoring Strategy" : "Create Scoring Strategy"}
      open={open}
      onCancel={handleCancel}
      afterOpenChange={(visible) => {
        if (visible) {
          initializeForm();
        }
      }}
      footer={null}
      width={720}
      destroyOnHidden
      closable
      styles={{
        body: { padding: 0 },
        header: {
          margin: 0,
          padding: `${token.paddingSM}px ${token.paddingSM}px`,
          borderBottom: `1px solid ${token.colorBorderSecondary}`,
        },
      }}
    >
      <div
        style={{
          padding: isCompact
            ? `${token.paddingMD}px ${token.paddingSM}px`
            : 24,
        }}
      >
        <ErrorAlert variant="form" error={formError} />

        <Form form={form} layout="vertical" requiredMark={false} onFinish={handleSubmit}>
          <ConditionalRenderer when={isEditMode}>
            <div style={{ marginBottom: 24 }}>
              <div style={{ marginBottom: 16 }}>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  Scope
                </Typography.Text>
                <div style={{ marginTop: 4 }}>
                  <Typography.Text strong>{target?.scope}</Typography.Text>
                </div>
              </div>
              <ConditionalRenderer when={target?.scope !== "GLOBAL"}>
                <div style={{ marginBottom: 16 }}>
                  <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                    Reference
                  </Typography.Text>
                  <div style={{ marginTop: 4 }}>
                    <Typography.Text strong>
                      {target ? resolveReferenceLabel(target) : "—"}
                    </Typography.Text>
                  </div>
                </div>
              </ConditionalRenderer>
              <div>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  Lane
                </Typography.Text>
                <div style={{ marginTop: 4 }}>
                  <Typography.Text strong>{editLaneLabel}</Typography.Text>
                </div>
              </div>
              <Form.Item name="laneProfile" hidden>
                <Input />
              </Form.Item>
            </div>
          </ConditionalRenderer>

          <ConditionalRenderer when={!isEditMode}>
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
                rules={[{ required: true, message: "Please select a reference" }]}
              >
                <Select
                  placeholder="Select reference"
                  style={{ height: 40 }}
                  loading={isLoadingRefsLocal}
                  options={referenceOptionsLocal}
                />
              </Form.Item>
            </ConditionalRenderer>

            <Form.Item
              name="laneProfile"
              label={
                <span>
                  Lane{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={laneProfileRules}
            >
              <Select
                placeholder="Select lane"
                style={{ height: 40 }}
                options={LANE_PROFILE_OPTIONS}
                onChange={handleLaneChange}
              />
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer when={!isEditMode}>
            <ScoringStrategyPresetsPanel
              laneProfile={laneProfile}
              strategy={strategyPreview}
              onPreset={handlePreset}
              onLaneChange={handleLaneChange}
            />
          </ConditionalRenderer>

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
            rules={[{ required: true, message: "Please select a screening method" }]}
          >
            <ScoringMethodField
              laneProfile={laneProfile}
              onMethodChange={handleMethodChange}
            />
          </Form.Item>

          <ScoringStrategyLaneSummary
            laneProfile={laneProfile}
            requiresJamb={requiresJamb}
          />

          <ConditionalRenderer when={showRequiresJambToggle}>
            <Form.Item
              name="requires_jamb"
              valuePropName="checked"
              style={{ marginBottom: showRenormalizeHelper ? 8 : 24 }}
            >
              <Checkbox>JAMB required for scoring</Checkbox>
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer when={showRenormalizeHelper}>
            <Typography.Text
              type="secondary"
              style={{
                display: "block",
                fontSize: token.fontSizeSM,
                marginBottom: 24,
              }}
            >
              {OPEN_UTME_RENORMALIZE_HELPER}
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer when={isEditMode}>
            <Alert
              type="warning"
              message="Changing the screening method mid-cycle is disruptive and only affects future scoring runs."
              style={{ marginBottom: 24 }}
              showIcon
            />
          </ConditionalRenderer>

          <ConditionalRenderer when={showPriorQualWarning}>
            <Alert
              type="warning"
              message={PRIOR_QUAL_STUB_WARNING}
              style={{ marginBottom: 24 }}
              showIcon
            />
          </ConditionalRenderer>

          <ConditionalRenderer when={isJambWeightsVisible}>
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
          </ConditionalRenderer>

          <ConditionalRenderer when={isJambWeightsVisible}>
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
          </ConditionalRenderer>

          <ConditionalRenderer when={Boolean(isMixed && screeningMethod)}>
            <Form.Item
              name="components"
              label={
                <span>
                  Component Weights{" "}
                  <span style={{ color: token.colorError, fontWeight: 700 }}>
                    *
                  </span>
                </span>
              }
              rules={[
                {
                  required: true,
                  message: "Component weights are required for mixed methods",
                },
              ]}
            >
              <ScoringComponentsBuilder method={screeningMethod} />
            </Form.Item>
          </ConditionalRenderer>

          <ConditionalRenderer when={isJambWeightsVisible}>
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
          </ConditionalRenderer>

          <Form.Item
            name="max_school_score"
            label={
              <span>
                {maxSchoolScoreLabel}{" "}
                <span style={{ color: token.colorError, fontWeight: 700 }}>
                  *
                </span>
              </span>
            }
            extra={maxSchoolScoreExtra}
            rules={maxScoreRules}
          >
            <InputNumber
              min={1}
              style={{ width: "100%", height: 40 }}
              placeholder={maxSchoolScorePlaceholder}
            />
          </Form.Item>

          <ConditionalRenderer
            when={
              isJambWeightsVisible &&
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

          <ConditionalRenderer
            when={
              Boolean(showSchoolOnlyPreview) &&
              typeof maxSchoolScore === "number" &&
              maxSchoolScore > 0
            }
          >
            <div style={{ marginBottom: 24 }}>
              <ScoringStrategyMaxScores
                maxJambScore={0}
                maxSchoolScore={maxSchoolScore}
                variant="expanded"
                hideJamb
                schoolLabel={
                  screeningMethod === "OLEVEL_ONLY" ? "O-Level scale cap" : "School"
                }
              />
            </div>
          </ConditionalRenderer>

          <Form.Item name="description" label="Description" rules={descriptionRules}>
            <Input.TextArea
              placeholder="Optional description (max 255 characters)"
              rows={3}
              maxLength={255}
              showCount
            />
          </Form.Item>
        </Form>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          padding: isCompact
            ? `${token.paddingMD}px ${token.paddingSM}px`
            : 24,
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
