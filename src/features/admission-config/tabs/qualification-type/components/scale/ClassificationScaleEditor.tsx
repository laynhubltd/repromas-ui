import { CLASSIFICATION_PRESET_TEMPLATES } from "@/shared/constants/priorQualificationTypeOptions";
import {
  ArrowDownOutlined,
  ArrowUpOutlined,
  MinusCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Flex, Form, Input, Space, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import type { QualificationTypeFormValues } from "../../types/prior-qualification-type";

type ClassificationScaleEditorProps = {
  form: FormInstance<QualificationTypeFormValues>;
};

export function ClassificationScaleEditor({ form }: ClassificationScaleEditorProps) {
  const applyPreset = (preset: (typeof CLASSIFICATION_PRESET_TEMPLATES)[keyof typeof CLASSIFICATION_PRESET_TEMPLATES]) => {
    form.setFieldsValue({
      classificationKey: preset.key,
      classificationItems: [...preset.items],
    });
  };

  return (
    <div>
      <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
        First row = best rank (used for minimum-class rules).
      </Typography.Text>

      <Space wrap style={{ marginBottom: 12 }}>
        <Button size="small" onClick={() => applyPreset(CLASSIFICATION_PRESET_TEMPLATES.ndClasses)}>
          {CLASSIFICATION_PRESET_TEMPLATES.ndClasses.label}
        </Button>
        <Button size="small" onClick={() => applyPreset(CLASSIFICATION_PRESET_TEMPLATES.aLevelGrades)}>
          {CLASSIFICATION_PRESET_TEMPLATES.aLevelGrades.label}
        </Button>
      </Space>

      <Form.Item name="classificationKey" hidden>
        <Input />
      </Form.Item>

      <Form.List
        name="classificationItems"
        rules={[
          {
            validator: async (_, items: string[] | undefined) => {
              const trimmed = (items ?? []).map((item) => item.trim()).filter(Boolean);
              if (trimmed.length < 2) {
                throw new Error("At least two entries are required.");
              }
              const seen = new Set<string>();
              for (const item of trimmed) {
                const key = item.toUpperCase();
                if (seen.has(key)) {
                  throw new Error(`Duplicate entry "${item}" is not allowed.`);
                }
                seen.add(key);
              }
            },
          },
        ]}
      >
        {(fields, { add, remove, move }, { errors }) => (
          <>
            {fields.map(({ key, name, ...restField }, index) => (
              <Flex key={key} gap={8} align="start" style={{ marginBottom: 8 }}>
                <Form.Item
                  {...restField}
                  name={name}
                  label={index === 0 ? "Rank (best first)" : undefined}
                  rules={[{ required: true, message: "Entry is required." }]}
                  style={{ flex: 1, marginBottom: 0 }}
                >
                  <Input placeholder="e.g. DISTINCTION" />
                </Form.Item>
                <Space size={4} style={{ marginTop: index === 0 ? 30 : 0 }}>
                  <Button
                    type="text"
                    size="small"
                    aria-label="Move up"
                    icon={<ArrowUpOutlined />}
                    disabled={index === 0}
                    onClick={() => move(index, index - 1)}
                  />
                  <Button
                    type="text"
                    size="small"
                    aria-label="Move down"
                    icon={<ArrowDownOutlined />}
                    disabled={index === fields.length - 1}
                    onClick={() => move(index, index + 1)}
                  />
                  <Button
                    type="text"
                    aria-label="Remove entry"
                    icon={<MinusCircleOutlined />}
                    onClick={() => remove(name)}
                    disabled={fields.length <= 2}
                  />
                </Space>
              </Flex>
            ))}
            <Form.ErrorList errors={errors} />
            <Button
              type="dashed"
              onClick={() => add("")}
              block
              icon={<PlusOutlined />}
              style={{ marginBottom: 8 }}
            >
              Add entry
            </Button>
          </>
        )}
      </Form.List>
    </div>
  );
}
