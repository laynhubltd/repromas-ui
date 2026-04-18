import { useToken } from "@/shared/hooks/useToken";
import type { SegmentedProps } from "antd";
import { Segmented } from "antd";
import type { CSSProperties } from "react";

const CLASS = "ui-kit-primary-segmented";

/**
 * A thin wrapper around AntD `Segmented` that colours the active item's
 * background with the theme's `colorPrimary` token and sets the label to
 * white for contrast.
 *
 * All standard `Segmented` props are forwarded as-is.
 */
export function PrimarySegmented<T extends string | number = string>({
  className,
  style,
  ...props
}: SegmentedProps<T>) {
  const { colorPrimary } = useToken();

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
