import { useToken } from "@/shared/hooks/useToken";
import { Flex, Form, Radio, Select, Typography } from "antd";
import {
  ALTERNATIVE_SET_OPTIONS,
  REQUIREMENT_RULE_INTENT_OPTIONS,
  type RequirementRuleIntent,
} from "../../utils/requirementRuleIntent";
import { alternativeSetRules } from "../../utils/validators";

type RequirementRuleIntentFieldProps = {
  disabled?: boolean;
};

export function RequirementRuleIntentField({
  disabled = false,
}: RequirementRuleIntentFieldProps) {
  const token = useToken();
  const ruleIntent = Form.useWatch<RequirementRuleIntent>("ruleIntent");

  return (
    <>
      <Form.Item
        name="ruleIntent"
        label="How does this rule apply?"
        rules={[{ required: true, message: "Select how this rule applies." }]}
      >
        <Radio.Group disabled={disabled} style={{ width: "100%" }}>
          <Flex vertical gap={token.marginSM}>
            {REQUIREMENT_RULE_INTENT_OPTIONS.map((option) => (
              <Radio
                key={option.value}
                value={option.value}
                style={{
                  alignItems: "flex-start",
                  padding: token.paddingSM,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  width: "100%",
                  marginInlineEnd: 0,
                }}
              >
                <Typography.Text strong style={{ display: "block" }}>
                  {option.label}
                </Typography.Text>
                <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
                  {option.description}
                </Typography.Text>
              </Radio>
            ))}
          </Flex>
        </Radio.Group>
      </Form.Item>

      {ruleIntent === "alternative" && (
        <Form.Item
          name="requirementGroup"
          label="Pick-one group"
          rules={alternativeSetRules}
          extra="Qualifications in the same group are interchangeable — the candidate only needs one."
        >
          <Select
            disabled={disabled}
            placeholder="Select alternative set"
            options={ALTERNATIVE_SET_OPTIONS.map((preset) => ({
              value: preset.value,
              label: preset.label,
            }))}
          />
        </Form.Item>
      )}
    </>
  );
}
