import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, InputNumber, Select, Typography } from "antd";
import type { DynamicFormLayoutFlags } from "../../utils/dynamicFormLayout";

type JambScore = { subjectId?: number; score?: number };

type JambWidgetProps = {
  value?: { scores?: JambScore[] };
  onChange: (value: { scores: JambScore[] }) => void;
  disabled?: boolean;
  subjectOptions?: Array<{ value: number; label: string }>;
  layout?: DynamicFormLayoutFlags;
};

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

export function JambWidget({
  value,
  onChange,
  disabled,
  subjectOptions = [],
  layout = defaultLayout,
}: JambWidgetProps) {
  const token = useToken();
  const scores = value?.scores ?? [];

  const updateScores = (next: JambScore[]) => {
    onChange({ scores: next });
  };

  const addScore = () => {
    updateScores([...scores, { subjectId: undefined, score: undefined }]);
  };

  const updateScore = (index: number, patch: Partial<JambScore>) => {
    updateScores(scores.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const removeScore = (index: number) => {
    updateScores(scores.filter((_, i) => i !== index));
  };

  return (
    <Flex vertical gap={12}>
      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        Enter your JAMB subject scores (0–400 per subject). Submitting replaces
        all previously saved JAMB rows.
      </Typography.Text>
      {scores.map((score, index) => {
        const usedInScores = new Set(
          scores
            .filter((_, rowIndex) => rowIndex !== index)
            .map((row) => row.subjectId)
            .filter((id): id is number => id != null),
        );

        const subjectOptionsForRow = subjectOptions.map((opt) => ({
          ...opt,
          disabled: usedInScores.has(opt.value),
        }));

        return (
        <Flex
          key={index}
          gap={8}
          align={layout.stackWidgetRows ? "stretch" : "center"}
          vertical={layout.stackWidgetRows}
          style={
            layout.stackWidgetRows
              ? {
                  border: `1px solid ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  padding: 12,
                  width: "100%",
                  overflow: "hidden",
                }
              : { width: "100%", overflow: "hidden" }
          }
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <Select
              value={score.subjectId}
              onChange={(v) => updateScore(index, { subjectId: v })}
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
          <InputNumber
            value={score.score}
            onChange={(v) => updateScore(index, { score: v ?? undefined })}
            disabled={disabled}
            min={0}
            max={400}
            placeholder="Score"
            style={{
              width: layout.stackWidgetRows ? "100%" : 120,
              flexShrink: 0,
            }}
          />
          <Button
            type="text"
            danger
            aria-label={`Remove JAMB score row ${index + 1}`}
            icon={<DeleteOutlined />}
            onClick={() => removeScore(index)}
            disabled={disabled}
            style={{
              ...touchIconButtonStyle,
              flexShrink: 0,
              alignSelf: layout.stackWidgetRows ? "flex-end" : undefined,
            }}
          />
        </Flex>
        );
      })}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addScore}
        disabled={disabled}
        block
        style={{ minHeight: 44 }}
      >
        Add subject score
      </Button>
    </Flex>
  );
}
