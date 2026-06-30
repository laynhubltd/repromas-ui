import {
  MAX_OLEVEL_SITTINGS_OPTIONS,
  MINIMUM_OLEVEL_CREDITS_OPTIONS,
} from "@/shared/constants/programAdmissionConfigOptions";
import { Collapse, Form, Select, Switch, Typography } from "antd";
import {
  englishSubjectIdRules,
  maxOlevelSittingsRules,
  mathematicsSubjectIdRules,
  minimumOlevelCreditsRules,
} from "../../utils/validators";
import { OlevelSubjectPickerField } from "./OlevelSubjectPickerField";

type OlevelCreditGateSectionProps = {
  defaultExpanded: boolean;
};

export function OlevelCreditGateSection({
  defaultExpanded,
}: OlevelCreditGateSectionProps) {
  const form = Form.useFormInstance();

  return (
    <Collapse
      defaultActiveKey={defaultExpanded ? ["gate"] : []}
      style={{ marginBottom: 16 }}
      items={[
        {
          key: "gate",
          label: (
            <Typography.Text strong>O-Level credit gate (DE pre-check)</Typography.Text>
          ),
          children: (
            <>
              <Typography.Text
                type="secondary"
                style={{ display: "block", marginBottom: 12 }}
              >
                Applied before program O-Level subject rules on the Direct Entry lane.
              </Typography.Text>

              <Form.Item
                name="minimumOlevelCredits"
                label="Minimum O-Level credits"
                rules={minimumOlevelCreditsRules}
                extra="Distinct subjects at credit grade or above."
              >
                <Select options={[...MINIMUM_OLEVEL_CREDITS_OPTIONS]} />
              </Form.Item>

              <Form.Item
                name="maxOlevelSittings"
                label="Max O-Level sittings"
                rules={maxOlevelSittingsRules}
                extra="Maximum number of exam sittings combined."
              >
                <Select options={[...MAX_OLEVEL_SITTINGS_OPTIONS]} />
              </Form.Item>

              <Form.Item
                name="requireOlevelEnglish"
                label="Require English credit"
                valuePropName="checked"
              >
                <Switch
                  onChange={(checked) => {
                    if (!checked) {
                      form.setFieldValue("englishSubjectId", null);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) =>
                  prev.requireOlevelEnglish !== cur.requireOlevelEnglish
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("requireOlevelEnglish") ? (
                    <Form.Item
                      name="englishSubjectId"
                      label="English subject"
                      rules={englishSubjectIdRules(true)}
                      extra="O-Level catalog subject used for DE credit-gate checks."
                    >
                      <OlevelSubjectPickerField
                        enabled
                        placeholder="Search English subject…"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>

              <Form.Item
                name="requireOlevelMathematics"
                label="Require Mathematics credit"
                valuePropName="checked"
              >
                <Switch
                  onChange={(checked) => {
                    if (!checked) {
                      form.setFieldValue("mathematicsSubjectId", null);
                    }
                  }}
                />
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prev, cur) =>
                  prev.requireOlevelMathematics !== cur.requireOlevelMathematics
                }
              >
                {({ getFieldValue }) =>
                  getFieldValue("requireOlevelMathematics") ? (
                    <Form.Item
                      name="mathematicsSubjectId"
                      label="Mathematics subject"
                      rules={mathematicsSubjectIdRules(true)}
                      extra="O-Level catalog subject used for DE credit-gate checks."
                    >
                      <OlevelSubjectPickerField
                        enabled
                        placeholder="Search Mathematics subject…"
                      />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </>
          ),
        },
      ]}
    />
  );
}
