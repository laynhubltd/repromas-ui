import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useGetAcademicSessionsForCyclesQuery } from "@/features/admission-config/tabs/admission-cycle/api/admissionCycleApi";
import {
  MATRIC_NUMBER_FORMAT_MAX_LENGTH,
  MATRIC_NUMBER_FORMAT_UI_COPY,
} from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex, InputNumber, Select, Spin, Typography } from "antd";
import type { MatricNumberFormatPreviewResponse } from "../types/matric-number-format";

type FormatPreviewPanelProps = {
  previewProgramId: number | undefined;
  previewSessionId: number | undefined;
  simulatedSequence: number;
  previewResult: MatricNumberFormatPreviewResponse | null;
  previewError: string | null;
  previewLoading: boolean;
  needsSession: boolean;
  isLengthInvalid: boolean;
  isSessionMissing: boolean;
  onProgramChange: (programId: number | undefined) => void;
  onSessionChange: (sessionId: number | undefined) => void;
  onSequenceChange: (sequence: number) => void;
};

export function FormatPreviewPanel({
  previewProgramId,
  previewSessionId,
  simulatedSequence,
  previewResult,
  previewError,
  previewLoading,
  needsSession,
  isLengthInvalid,
  isSessionMissing,
  onProgramChange,
  onSessionChange,
  onSequenceChange,
}: FormatPreviewPanelProps) {
  const token = useToken();

  const { data: programsData, isLoading: isProgramsLoading } = useGetProgramsQuery({
    itemsPerPage: 200,
  });
  const { data: sessionsData, isLoading: isSessionsLoading } =
    useGetAcademicSessionsForCyclesQuery();

  const programs = programsData?.member ?? [];
  const sessions = sessionsData?.member ?? [];

  const previewColor = isLengthInvalid || previewError
    ? token.colorError
    : isSessionMissing
      ? token.colorWarning
      : token.colorSuccess;

  return (
    <Flex
      vertical
      gap={16}
      style={{
        padding: token.paddingMD,
        border: `1px solid ${token.colorBorderSecondary}`,
        borderRadius: token.borderRadius,
        background: token.colorBgContainer,
        position: "sticky",
        top: 16,
      }}
    >
      <Typography.Text strong>Live preview</Typography.Text>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        {MATRIC_NUMBER_FORMAT_UI_COPY.previewDisclaimer}
      </Typography.Text>

      <Flex vertical gap={12}>
        <div>
          <Typography.Text style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 4 }}>
            Sample program
          </Typography.Text>
          <Select
            placeholder="Select program"
            loading={isProgramsLoading}
            value={previewProgramId}
            onChange={onProgramChange}
            allowClear
            showSearch
            optionFilterProp="label"
            style={{ width: "100%" }}
            options={programs.map((p) => ({
              value: p.id,
              label: p.department?.name ? `${p.name} (${p.department.name})` : p.name,
            }))}
          />
        </div>

        <ConditionalRenderer when={needsSession}>
          <div>
            <Typography.Text style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 4 }}>
              Sample session
            </Typography.Text>
            <Select
              placeholder="Select session"
              loading={isSessionsLoading}
              value={previewSessionId}
              onChange={onSessionChange}
              allowClear
              showSearch
              optionFilterProp="label"
              style={{ width: "100%" }}
              options={sessions.map((s) => ({ value: s.id, label: s.name }))}
            />
          </div>
        </ConditionalRenderer>

        <div>
          <Typography.Text style={{ fontSize: token.fontSizeSM, display: "block", marginBottom: 4 }}>
            Simulated sequence
          </Typography.Text>
          <InputNumber
            min={1}
            precision={0}
            value={simulatedSequence}
            onChange={(val) => onSequenceChange(typeof val === "number" ? val : 1)}
            style={{ width: "100%" }}
          />
        </div>
      </Flex>

      <div
        style={{
          padding: token.paddingMD,
          background: token.colorBgLayout,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorder}`,
        }}
      >
        <ConditionalRenderer when={previewLoading}>
          <Flex align="center" gap={8}>
            <Spin size="small" />
            <Typography.Text type="secondary">Generating preview…</Typography.Text>
          </Flex>
        </ConditionalRenderer>

        <ConditionalRenderer when={!previewLoading}>
          <Typography.Text style={{ fontSize: token.fontSizeSM, display: "block" }}>
            Preview
          </Typography.Text>
          <Typography.Text
            strong
            style={{
              fontSize: token.fontSizeLG,
              fontFamily: "monospace",
              color: previewColor,
              wordBreak: "break-all",
            }}
          >
            {previewResult?.preview ?? (previewError ? "—" : "Select a program to preview")}
          </Typography.Text>

          <ConditionalRenderer when={!!previewError}>
            <Typography.Text type="danger" style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 8 }}>
              {previewError}
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer when={previewResult !== null}>
            <Typography.Text
              style={{
                fontSize: token.fontSizeSM,
                display: "block",
                marginTop: 8,
                color: isLengthInvalid ? token.colorError : token.colorTextSecondary,
              }}
            >
              Length: {previewResult?.length ?? 0} / {MATRIC_NUMBER_FORMAT_MAX_LENGTH}
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer when={isSessionMissing}>
            <Typography.Text
              style={{ fontSize: token.fontSizeSM, display: "block", marginTop: 8, color: token.colorWarning }}
            >
              Session required for preview when template includes session tokens.
            </Typography.Text>
          </ConditionalRenderer>
        </ConditionalRenderer>
      </div>
    </Flex>
  );
}
