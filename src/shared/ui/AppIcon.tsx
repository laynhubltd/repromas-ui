import { forwardRef } from "react";
import type { ComponentType, SVGProps, CSSProperties } from "react";
import { icons, type HugeiconsIcon } from "@/assets/hugeicons";

export type IconSizePreset = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

const SIZE_PRESET_MAP: Record<IconSizePreset, number> = {
  xs: 14,
  sm: 16,
  md: 18,
  lg: 22,
  xl: 28,
  "2xl": 36,
};

export interface AppIconProps extends Omit<SVGProps<SVGSVGElement>, "color"> {
  /** Direct SVG component imported via `*.svg?react` */
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Registered Hugeicons name from `@/assets/hugeicons` */
  name?: HugeiconsIcon;
  /**
   * Predefined semantic size preset or explicit numeric/string size:
   * - "xs" = 14px (badges, tiny tags)
   * - "sm" = 16px (inputs, compact tables)
   * - "md" = 18px (default - menus, buttons)
   * - "lg" = 22px (headers, modal titles)
   * - "xl" = 28px (cards, hero)
   * - "2xl" = 36px (empty states, banners)
   */
  size?: IconSizePreset | number | string;
  /** Icon color (default: "currentColor" to inherit text/theme color) */
  color?: string;
  /** Alternate icon for toggle micro-interactions */
  altIcon?: ComponentType<SVGProps<SVGSVGElement>>;
  /** Alternate icon name */
  altName?: HugeiconsIcon;
  /** Whether to render the alternate icon */
  showAlt?: boolean;
}

/**
 * AppIcon — Unified Hugeicons design-system component using local SVGs.
 *
 * Supports both direct component imports (`<AppIcon icon={DashboardIcon} />`)
 * and string name lookups (`<AppIcon name="dashboard" />`).
 */
export const AppIcon = forwardRef<HTMLSpanElement, AppIconProps>(
  (
    {
      icon,
      name,
      size = "md",
      color = "currentColor",
      altIcon,
      altName,
      showAlt = false,
      className,
      style,
      ...restSvgProps
    },
    ref
  ) => {
    // Resolve which component to render (handles alt toggling)
    let TargetComponent: ComponentType<SVGProps<SVGSVGElement>> | undefined;

    if (showAlt) {
      TargetComponent = altIcon ?? (altName ? icons[altName] : undefined);
    }

    if (!TargetComponent) {
      TargetComponent = icon ?? (name ? icons[name] : undefined);
    }

    if (!TargetComponent) {
      return null;
    }

    const resolvedSize =
      typeof size === "string" && size in SIZE_PRESET_MAP
        ? SIZE_PRESET_MAP[size as IconSizePreset]
        : size;

    const wrapperStyle: CSSProperties = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: 0,
      verticalAlign: "middle",
      width: resolvedSize,
      height: resolvedSize,
      color,
      ...style,
    };

    const svgStyle: CSSProperties = {
      width: "100%",
      height: "100%",
      display: "block",
    };

    return (
      <span
        ref={ref}
        className={`app-icon inline-flex items-center justify-center shrink-0 ${className ?? ""}`}
        style={wrapperStyle}
        data-testid="app-icon-wrapper"
      >
        <TargetComponent
          width={resolvedSize}
          height={resolvedSize}
          style={svgStyle}
          {...restSvgProps}
        />
      </span>
    );
  }
);

AppIcon.displayName = "AppIcon";

export default AppIcon;
