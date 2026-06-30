import { DownOutlined } from "@ant-design/icons";
import { useToken } from "@/shared/hooks/useToken";
import type { SegmentedProps } from "antd";
import { Dropdown, Grid, Segmented, Typography } from "antd";
import type { MenuProps } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useMemo } from "react";
import {
  getSegmentedOptionLabel,
  normalizeSegmentedOptions,
  type NormalizedSegmentedOption,
} from "./primarySegmentedOptions";

const CLASS = "ui-kit-primary-segmented";
const MOBILE_TOGGLE_WIDTH = 48;

export type PrimarySegmentedResponsiveBelow = "sm" | "md" | "lg";

export type PrimarySegmentedProps<T extends string | number = string> = SegmentedProps<T> & {
  /** Switch to the mobile dropdown below this breakpoint. Set `false` to always use segments. */
  responsiveBelow?: PrimarySegmentedResponsiveBelow | false;
};

function shouldUseMobilePicker(
  screens: Partial<Record<PrimarySegmentedResponsiveBelow, boolean>>,
  responsiveBelow: PrimarySegmentedResponsiveBelow,
): boolean {
  return !screens[responsiveBelow];
}

type PrimarySegmentedMobilePickerProps<T extends string | number> = {
  options: NormalizedSegmentedOption<T>[];
  value: T | undefined;
  disabled?: boolean;
  onChange?: (value: T) => void;
  className?: string;
  style?: CSSProperties;
  "aria-label"?: string;
};

function PrimarySegmentedMobilePicker<T extends string | number>({
  options,
  value,
  disabled = false,
  onChange,
  className,
  style,
  "aria-label": ariaLabel,
}: PrimarySegmentedMobilePickerProps<T>) {
  const token = useToken();
  const selectedLabel = getSegmentedOptionLabel(options, value);

  const menuItems = useMemo<MenuProps["items"]>(
    () =>
      options.map((option) => ({
        key: String(option.value),
        label: option.label,
        disabled: option.disabled,
      })),
    [options],
  );

  const handleMenuClick: MenuProps["onClick"] = ({ key, domEvent }) => {
    domEvent.stopPropagation();
    const selected = options.find((option) => String(option.value) === key);
    if (!selected || selected.disabled) return;
    onChange?.(selected.value);
  };

  return (
    <Dropdown
      trigger={["click"]}
      disabled={disabled}
      menu={{
        items: menuItems,
        selectable: true,
        selectedKeys: value == null ? [] : [String(value)],
        onClick: handleMenuClick,
      }}
    >
      <button
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        disabled={disabled}
        className={className}
        style={{
          display: "flex",
          width: "100%",
          minHeight: 40,
          padding: 0,
          border: `1px solid ${token.colorPrimary}`,
          borderRadius: token.borderRadius,
          overflow: "hidden",
          background: token.colorBgContainer,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.65 : 1,
          ...style,
        }}
      >
        <span
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            paddingInline: token.paddingMD,
            minWidth: 0,
            textAlign: "left",
          }}
        >
          <Typography.Text ellipsis style={{ width: "100%" }}>
            {selectedLabel as ReactNode}
          </Typography.Text>
        </span>
        <span
          aria-hidden
          style={{
            width: MOBILE_TOGGLE_WIDTH,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: token.colorPrimary,
            color: "#fff",
          }}
        >
          <DownOutlined style={{ fontSize: 12 }} />
        </span>
      </button>
    </Dropdown>
  );
}

/**
 * Primary-coloured segmented control. On narrow viewports it collapses into a
 * single-row dropdown matching the mobile admission-config group picker design.
 */
export function PrimarySegmented<T extends string | number = string>({
  className,
  style,
  responsiveBelow = "md",
  options,
  value,
  defaultValue,
  disabled,
  onChange,
  "aria-label": ariaLabel,
  ...props
}: PrimarySegmentedProps<T>) {
  const { colorPrimary } = useToken();
  const screens = Grid.useBreakpoint();
  const normalizedOptions = useMemo(
    () => normalizeSegmentedOptions(options),
    [options],
  );

  const resolvedValue = (value ?? defaultValue) as T | undefined;
  const useMobilePicker =
    responsiveBelow !== false && shouldUseMobilePicker(screens, responsiveBelow);

  if (useMobilePicker) {
    return (
      <PrimarySegmentedMobilePicker
        options={normalizedOptions}
        value={resolvedValue}
        disabled={disabled}
        className={className}
        style={style}
        aria-label={ariaLabel}
        onChange={(nextValue) => onChange?.(nextValue)}
      />
    );
  }

  return (
    <>
      <style>{`
        .${CLASS} .ant-segmented-item-selected {
          background-color: var(--ui-kit-primary-segmented-color);
        }
        .${CLASS} .ant-segmented-item-selected .ant-segmented-item-label {
          color: #fff;
        }
        .${CLASS} .ant-segmented-item:not(.ant-segmented-item-selected) {
          cursor: pointer;
          border: 1px solid color-mix(in srgb, var(--ui-kit-primary-segmented-color) 30%, transparent);
          border-radius: 4px;
        }
        .${CLASS} .ant-segmented-item:not(.ant-segmented-item-selected) .ant-segmented-item-label {
          color: var(--ui-kit-primary-segmented-color);
          font-weight: 500;
        }
        .${CLASS} .ant-segmented-item:not(.ant-segmented-item-selected):hover {
          background-color: color-mix(in srgb, var(--ui-kit-primary-segmented-color) 10%, transparent);
        }
      `}</style>
      <Segmented<T>
        {...props}
        options={options}
        value={value}
        defaultValue={defaultValue}
        disabled={disabled}
        onChange={onChange}
        aria-label={ariaLabel}
        className={`${CLASS}${className ? ` ${className}` : ""}`}
        style={
          {
            "--ui-kit-primary-segmented-color": colorPrimary,
            ...style,
          } as CSSProperties
        }
      />
    </>
  );
}

export { normalizeSegmentedOptions, shouldUseMobilePicker };
