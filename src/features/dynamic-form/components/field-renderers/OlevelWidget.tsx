import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Input, InputNumber, Select, Typography } from "antd";
import type { DynamicFormLayoutFlags } from "../../utils/dynamicFormLayout";
import { resolveGradeRowDirection } from "../../utils/dynamicFormLayout";

type OlevelGrade = { subjectId?: number; grade?: string };
type OlevelSitting = {
  examType?: string;
  examYear?: number;
  examRegNo?: string;
  centerNumber?: string;
  schoolName?: string;
  grades?: OlevelGrade[];
};

type OlevelWidgetProps = {
  value?: { sittings?: OlevelSitting[] };
  onChange: (value: { sittings: OlevelSitting[] }) => void;
  disabled?: boolean;
  subjectOptions?: Array<{ value: number; label: string }>;
  layout?: DynamicFormLayoutFlags;
};

const EXAM_TYPES = ["WAEC", "NECO", "NABTEB", "GCE"];
const OLEVEL_GRADES = ["A1", "B2", "B3", "C4", "C5", "C6", "D7", "E8", "F9"];

const defaultLayout: DynamicFormLayoutFlags = {
  isMobile: false,
  isXs: false,
  fieldWidth: "100%",
  stackRadioVertical: false,
  stackWidgetRows: false,
  stackSittingCards: false,
  stepsVariant: "horizontal",
  navButtonsBlock: false,
  stickyNav: false,
};

const touchIconButtonStyle = { minWidth: 44, minHeight: 44 };

export function OlevelWidget({
  value,
  onChange,
  disabled,
  subjectOptions = [],
  layout = defaultLayout,
}: OlevelWidgetProps) {
  const token = useToken();
  const sittings = value?.sittings ?? [];
  const gradeRowDirection = resolveGradeRowDirection(layout.isXs);

  const updateSittings = (next: OlevelSitting[]) => {
    onChange({ sittings: next });
  };

  const addSitting = () => {
    updateSittings([
      ...sittings,
      { examType: "WAEC", examYear: new Date().getFullYear(), grades: [] },
    ]);
  };

  const updateSitting = (index: number, patch: Partial<OlevelSitting>) => {
    const next = sittings.map((s, i) => (i === index ? { ...s, ...patch } : s));
    updateSittings(next);
  };

  const removeSitting = (index: number) => {
    updateSittings(sittings.filter((_, i) => i !== index));
  };

  const addGrade = (sittingIndex: number) => {
    const sitting = sittings[sittingIndex];
    const grades = [
      ...(sitting.grades ?? []),
      { subjectId: undefined, grade: undefined },
    ];
    updateSitting(sittingIndex, { grades });
  };

  const updateGrade = (
    sittingIndex: number,
    gradeIndex: number,
    patch: Partial<OlevelGrade>,
  ) => {
    const sitting = sittings[sittingIndex];
    const grades = (sitting.grades ?? []).map((g, i) =>
      i === gradeIndex ? { ...g, ...patch } : g,
    );
    updateSitting(sittingIndex, { grades });
  };

  const removeGrade = (sittingIndex: number, gradeIndex: number) => {
    const sitting = sittings[sittingIndex];
    const grades = (sitting.grades ?? []).filter((_, i) => i !== gradeIndex);
    updateSitting(sittingIndex, { grades });
  };

  return (
    <Flex vertical gap={16}>
      <Flex
        gap={16}
        align="stretch"
        wrap="wrap"
        vertical={layout.stackSittingCards}
        style={{ width: "100%" }}
      >
        {sittings.map((sitting, si) => (
          <div
            key={si}
            style={{
              flex: layout.stackSittingCards ? "1 1 100%" : "1 1 0",
              minWidth: layout.stackSittingCards ? undefined : 280,
              width: layout.stackSittingCards ? "100%" : undefined,
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              padding: 16,
            }}
          >
            <Flex
              justify="space-between"
              align="center"
              style={{ marginBottom: 12 }}
            >
              <Typography.Text strong>Sitting {si + 1}</Typography.Text>
              <Button
                type="text"
                danger
                aria-label={`Remove sitting ${si + 1}`}
                icon={<DeleteOutlined />}
                onClick={() => removeSitting(si)}
                disabled={disabled}
                style={touchIconButtonStyle}
              />
            </Flex>
            <Flex vertical gap={12}>
              <Select
                value={sitting.examType}
                onChange={(v) => updateSitting(si, { examType: v })}
                options={EXAM_TYPES.map((t) => ({ value: t, label: t }))}
                disabled={disabled}
                placeholder="Exam type"
                style={{ width: "100%" }}
              />
              <InputNumber
                value={sitting.examYear}
                onChange={(v) =>
                  updateSitting(si, { examYear: v ?? undefined })
                }
                disabled={disabled}
                placeholder="Exam year"
                min={1980}
                max={new Date().getFullYear()}
                style={{ width: "100%" }}
              />
              <Input
                value={sitting.examRegNo}
                onChange={(e) =>
                  updateSitting(si, { examRegNo: e.target.value })
                }
                disabled={disabled}
                placeholder="Exam registration number"
              />
              <Input
                value={sitting.centerNumber}
                onChange={(e) =>
                  updateSitting(si, { centerNumber: e.target.value })
                }
                disabled={disabled}
                placeholder="Center number"
              />
              <Input
                value={sitting.schoolName}
                onChange={(e) =>
                  updateSitting(si, { schoolName: e.target.value })
                }
                disabled={disabled}
                placeholder="School name"
              />
              <Typography.Text
                type="secondary"
                style={{ fontSize: token.fontSizeSM }}
              >
                Subject grades
              </Typography.Text>
              {(sitting.grades ?? []).map((grade, gi) => {
                // Build the set of subjectIds already used by other rows in this sitting
                const usedInSitting = new Set(
                  (sitting.grades ?? [])
                    .filter((_, idx) => idx !== gi)
                    .map((g) => g.subjectId)
                    .filter((id): id is number => id != null),
                );

                const subjectOptionsForRow = subjectOptions.map((opt) => ({
                  ...opt,
                  disabled: usedInSitting.has(opt.value),
                }));

                return (
                  <Flex
                    key={gi}
                    gap={8}
                    align={
                      gradeRowDirection === "vertical" ? "stretch" : "center"
                    }
                    vertical={gradeRowDirection === "vertical"}
                    style={{ width: "100%", overflow: "hidden" }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Select
                        value={grade.subjectId}
                        onChange={(v) => updateGrade(si, gi, { subjectId: v })}
                        options={subjectOptionsForRow}
                        disabled={disabled}
                        placeholder="Subject"
                        showSearch
                        filterOption={(input, option) =>
                          String(option?.label ?? "")
                            .toLowerCase()
                            .includes(input.toLowerCase())
                        }
                        style={{ width: "100%" }}
                      />
                    </div>
                    <div style={{ flexShrink: 0, width: gradeRowDirection === "vertical" ? "100%" : 90 }}>
                      <Select
                        value={grade.grade}
                        onChange={(v) => updateGrade(si, gi, { grade: v })}
                        options={OLEVEL_GRADES.map((g) => ({ value: g, label: g }))}
                        disabled={disabled}
                        placeholder="Grade"
                        style={{ width: "100%" }}
                      />
                    </div>
                    <Button
                      type="text"
                      danger
                      aria-label={`Remove subject grade ${gi + 1}`}
                      icon={<DeleteOutlined />}
                      onClick={() => removeGrade(si, gi)}
                      disabled={disabled}
                      style={{
                        ...touchIconButtonStyle,
                        flexShrink: 0,
                        alignSelf:
                          gradeRowDirection === "vertical"
                            ? "flex-end"
                            : undefined,
                      }}
                    />
                  </Flex>
                );
              })}
              <Button
                type="dashed"
                size="small"
                onClick={() => addGrade(si)}
                disabled={disabled}
                style={{ minHeight: 44 }}
              >
                Add subject grade
              </Button>
            </Flex>
          </div>
        ))}
      </Flex>
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addSitting}
        disabled={disabled}
        block
        style={{ minHeight: 44 }}
      >
        Add sitting
      </Button>
    </Flex>
  );
}
