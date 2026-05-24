import { useGetFeeItemsQuery } from "@/features/billing/tabs/fee-items/api/feeItemApi";
import { PRICING_RULE_FEE_ITEM_PICKER_PAGE_SIZE } from "@/shared/constants/pricingRuleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Flex, Form, InputNumber, Select, Switch, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import { useMemo } from "react";
import {
  computeGrossPreview,
  formatCurrencyDisplay,
} from "../utils/computeGrossPreview";
import type { PricingRuleFormValues } from "../utils/pricingRulePayload";
import { amountRules, feeItemIdRules } from "../utils/validators";

type PricingRuleLineEditorProps = {
  form: FormInstance<PricingRuleFormValues>;
  disabled?: boolean;
  /** When false, line-level rules are omitted (wizard steps before fee lines). */
  validateLines?: boolean;
};

export function PricingRuleLineEditor({
  form,
  disabled = false,
  validateLines = true,
}: PricingRuleLineEditorProps) {
  const token = useToken();

  const { data: feeItemsData, isLoading: isFeeItemsLoading } = useGetFeeItemsQuery({
    itemsPerPage: PRICING_RULE_FEE_ITEM_PICKER_PAGE_SIZE,
    sort: "name:asc",
    "exact[isActive]": true,
  });

  const feeItemOptions = useMemo(
    () =>
      (feeItemsData?.member ?? []).map((item) => ({
        value: item.id,
        label: item.accountingCode
          ? `${item.name} (${item.accountingCode})`
          : item.name,
      })),
    [feeItemsData],
  );

  const items = Form.useWatch("items", form) ?? [];
  const grossPreview = computeGrossPreview(items);

  const hasFeeItems = feeItemOptions.length > 0;

  return (
    <Flex vertical gap={12}>
      {!hasFeeItems && !isFeeItemsLoading ? (
        <Typography.Text type="warning" style={{ fontSize: token.fontSizeSM }}>
          No active fee items. Create fee items on the Fee Items tab first.
        </Typography.Text>
      ) : null}

      <Form.List name="items">
        {(fields, { add, remove }) => (
          <Flex vertical gap={12}>
            {fields.map((field, index) => (
              <Flex
                key={field.key}
                gap={8}
                align="flex-start"
                wrap="wrap"
                style={{
                  padding: 12,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgLayout,
                }}
              >
                <Form.Item
                  {...field}
                  name={[field.name, "feeItemId"]}
                  label={index === 0 ? "Fee item" : undefined}
                  rules={validateLines ? feeItemIdRules : []}
                  style={{ flex: "1 1 200px", marginBottom: 0 }}
                >
                  <Select
                    placeholder="Select fee item"
                    options={feeItemOptions}
                    loading={isFeeItemsLoading}
                    disabled={disabled || !hasFeeItems}
                    showSearch
                    optionFilterProp="label"
                    style={{ width: "100%" }}
                  />
                </Form.Item>

                <Form.Item
                  {...field}
                  name={[field.name, "amount"]}
                  label={index === 0 ? "Amount (₦)" : undefined}
                  rules={validateLines ? amountRules : []}
                  style={{ flex: "0 1 140px", marginBottom: 0 }}
                >
                  <InputNumber
                    min={0.01}
                    precision={2}
                    placeholder="0.00"
                    disabled={disabled}
                    style={{ width: "100%" }}
                    prefix="₦"
                  />
                </Form.Item>

                <Form.Item
                  {...field}
                  name={[field.name, "isMandatory"]}
                  label={index === 0 ? "Mandatory" : undefined}
                  valuePropName="checked"
                  style={{ flex: "0 0 auto", marginBottom: 0 }}
                >
                  <Switch disabled={disabled} />
                </Form.Item>

                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={disabled || fields.length <= 1}
                  onClick={() => remove(field.name)}
                  style={{ marginTop: index === 0 ? 30 : 0 }}
                  title="Remove line"
                />
              </Flex>
            ))}

            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={() =>
                add({ isMandatory: true, amount: undefined, feeItemId: undefined })
              }
              disabled={disabled || !hasFeeItems}
              block
            >
              Add fee line
            </Button>
          </Flex>
        )}
      </Form.List>

      <Flex justify="flex-end">
        <Typography.Text strong style={{ fontSize: token.fontSizeLG }}>
          Total: {formatCurrencyDisplay(grossPreview)}
        </Typography.Text>
      </Flex>
    </Flex>
  );
}
