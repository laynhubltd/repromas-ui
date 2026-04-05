import { Col, Grid, Row } from "antd";
import type { ColProps, RowProps } from "antd";
import type { ReactNode } from "react";
import type { UIResponsiveBreakpoint, UIKitCommonProps } from "../foundation";
import { Accordion, type AccordionExpansionMode } from "./Accordion";

type ScreenState = Partial<Record<UIResponsiveBreakpoint, boolean>>;

export type ResponsiveCollapsibleGridMode = "auto" | "grid" | "collapse";

export interface ResponsiveCollapsibleGridSection {
  key: string;
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  content: ReactNode;
  mobileContent?: ReactNode;
  desktopColProps?: Omit<ColProps, "children">;
}

export interface ResponsiveCollapsibleGridProps extends UIKitCommonProps {
  sections: ResponsiveCollapsibleGridSection[];
  collapseBelow?: UIResponsiveBreakpoint;
  mode?: ResponsiveCollapsibleGridMode;
  desktopGutter?: RowProps["gutter"];
  mobileExpansionMode?: AccordionExpansionMode;
  defaultMobileExpandedKeys?: string[];
  mobileExpandedKeys?: string[];
  onMobileExpandedKeysChange?: (keys: string[]) => void;
  mobileAriaLabel?: string;
}

const DEFAULT_DESKTOP_GUTTER: RowProps["gutter"] = [16, 16];

function shouldCollapseForBreakpoint(
  screens: ScreenState,
  collapseBelow: UIResponsiveBreakpoint,
): boolean {
  return !screens[collapseBelow];
}

function shouldCollapse(
  mode: ResponsiveCollapsibleGridMode,
  screens: ScreenState,
  collapseBelow: UIResponsiveBreakpoint,
): boolean {
  if (mode === "collapse") {
    return true;
  }
  if (mode === "grid") {
    return false;
  }
  return shouldCollapseForBreakpoint(screens, collapseBelow);
}

export function ResponsiveCollapsibleGrid({
  sections,
  collapseBelow = "md",
  mode = "auto",
  desktopGutter = DEFAULT_DESKTOP_GUTTER,
  mobileExpansionMode = "single",
  defaultMobileExpandedKeys,
  mobileExpandedKeys,
  onMobileExpandedKeysChange,
  mobileAriaLabel = "Collapsible content sections",
  className,
  style,
  "data-testid": dataTestId,
}: ResponsiveCollapsibleGridProps) {
  const screens = Grid.useBreakpoint();

  if (sections.length === 0) {
    return null;
  }

  if (shouldCollapse(mode, screens, collapseBelow)) {
    return (
      <Accordion
        className={className}
        style={style}
        data-testid={dataTestId}
        aria-label={mobileAriaLabel}
        expansionMode={mobileExpansionMode}
        defaultActiveKeys={defaultMobileExpandedKeys}
        activeKeys={mobileExpandedKeys}
        onActiveKeysChange={onMobileExpandedKeysChange}
        items={sections.map((section) => ({
          key: section.key,
          title: section.title,
          subtitle: section.subtitle,
          extra: section.extra,
          content: section.mobileContent ?? section.content,
        }))}
      />
    );
  }

  return (
    <Row className={className} style={style} data-testid={dataTestId} gutter={desktopGutter}>
      {sections.map((section) => (
        <Col key={section.key} span={24} {...section.desktopColProps}>
          {section.content}
        </Col>
      ))}
    </Row>
  );
}
