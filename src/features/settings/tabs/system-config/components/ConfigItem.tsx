import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { MoreOutlined } from "@ant-design/icons";
import {
  Button,
  Dropdown,
  Input,
  InputNumber,
  Switch,
  Typography,
} from "antd";
import { usePrimitiveConfigItem } from "../hooks/usePrimitiveConfigItem";
import {
  isActionBasedConfigItem,
  type AnyPrimitiveConfigItemProps,
  type ConfigItemProps,
} from "../types/config-item";

type ConfigItemLabelProps = {
  label: string;
  summary?: string | null;
  isNotConfigured?: boolean;
};

function ConfigItemLabel({ label, summary, isNotConfigured }: ConfigItemLabelProps) {
  const token = useToken();

  return (
    <div style={{ flex: "1 1 200px", minWidth: 0 }}>
      <Typography.Text
        strong
        style={{ fontSize: token.fontSize, display: "block" }}
        ellipsis
      >
        {label}
      </Typography.Text>

      <ConditionalRenderer when={!!summary}>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block" }}
          ellipsis
        >
          {summary}
        </Typography.Text>
      </ConditionalRenderer>

      <ConditionalRenderer when={!!isNotConfigured && !summary}>
        <Typography.Text
          type="secondary"
          style={{ fontSize: token.fontSizeSM, display: "block" }}
        >
          Not configured
        </Typography.Text>
      </ConditionalRenderer>
    </div>
  );
}

function useConfigItemContainerStyle() {
  const token = useToken();

  return {
    border: `1px solid ${token.colorBorder}`,
    borderRadius: token.borderRadius,
    marginBottom: 12,
    overflow: "hidden" as const,
    background: token.colorBgContainer,
  };
}

function useConfigItemRowStyle() {
  return {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 16px",
    gap: 12,
  };
}

function ActionBasedConfigItem(
  props: Extract<ConfigItemProps, { type: "ARRAY" | "JSON_OBJECT" }>,
) {
  const token = useToken();
  const containerStyle = useConfigItemContainerStyle();
  const rowStyle = useConfigItemRowStyle();
  const { label, actions, summary, isNotConfigured } = props;

  return (
    <div style={containerStyle}>
      <div style={rowStyle}>
        <ConfigItemLabel
          label={label}
          summary={summary}
          isNotConfigured={isNotConfigured}
        />

        <Dropdown menu={{ items: actions }} trigger={["click"]} placement="bottomRight">
          <Button
            type="text"
            size="small"
            icon={<MoreOutlined style={{ fontSize: 16 }} />}
            style={{ color: token.colorTextTertiary }}
            onClick={(e) => e.stopPropagation()}
          />
        </Dropdown>
      </div>
    </div>
  );
}

function PrimitiveConfigItem<TData, TPayload>(
  props: AnyPrimitiveConfigItemProps<TData, TPayload>,
) {
  const containerStyle = useConfigItemContainerStyle();
  const rowStyle = useConfigItemRowStyle();

  const { state, actions, flags } = usePrimitiveConfigItem(props);

  const disabled = props.disabled || flags.isReadOnly;

  const renderControl = () => {
    switch (props.type) {
      case "BOOLEAN":
        return (
          <Switch
            checked={state.value as boolean}
            disabled={disabled}
            onChange={(checked) => void actions.handleChange(checked)}
          />
        );

      case "STRING":
        return (
          <Input
            value={state.value as string}
            placeholder={props.placeholder}
            disabled={disabled}
            style={{ width: 220 }}
            onChange={(e) => void actions.handleChange(e.target.value)}
            onBlur={actions.handleBlurPersist}
          />
        );

      case "INTEGER":
        return (
          <InputNumber
            value={state.value as number}
            precision={0}
            min={props.min}
            max={props.max}
            disabled={disabled}
            style={{ width: 120 }}
            onChange={(num) => {
              if (num !== null) void actions.handleChange(num);
            }}
            onBlur={actions.handleBlurPersist}
          />
        );

      case "FLOAT":
        return (
          <InputNumber
            value={state.value as number}
            min={props.min}
            max={props.max}
            step={props.step ?? 0.1}
            disabled={disabled}
            style={{ width: 120 }}
            onChange={(num) => {
              if (num !== null) void actions.handleChange(num);
            }}
            onBlur={actions.handleBlurPersist}
          />
        );

      default:
        return null;
    }
  };

  return (
    <div style={containerStyle}>
      <DataLoader loading={state.isLoading} minHeight={52}>
        <div style={rowStyle}>
          <ConfigItemLabel label={props.label} summary={state.summary} />

          <div style={{ flex: "0 0 auto" }}>{renderControl()}</div>
        </div>
      </DataLoader>
    </div>
  );
}

export function ConfigItem<TData = unknown, TPayload = unknown>(
  props: ConfigItemProps<TData, TPayload>,
) {
  if (isActionBasedConfigItem(props)) {
    return <ActionBasedConfigItem {...props} />;
  }

  return <PrimitiveConfigItem {...props} />;
}
