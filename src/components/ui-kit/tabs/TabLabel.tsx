import { Badge } from "antd";
import type { ReactNode } from "react";
import type { UIComponentSize } from "../foundation";

export interface TabLabelProps {
  label: ReactNode;
  icon?: ReactNode;
  badge?: number | "dot";
  size?: UIComponentSize;
  disabled?: boolean;
}

const SIZE_FONT: Record<UIComponentSize, string> = {
  sm: "12px",
  md: "14px",
  lg: "16px",
};

export function TabLabel({ label, icon, badge, size = "md" }: TabLabelProps) {
  const content = (
    <span style={{ fontSize: SIZE_FONT[size], display: "inline-flex", alignItems: "center", gap: 6 }}>
      {icon}
      {label}
    </span>
  );

  if (badge === "dot") {
    return <Badge dot offset={[4, 0]}>{content}</Badge>;
  }

  if (typeof badge === "number" && badge > 0) {
    return <Badge count={badge} offset={[4, 0]}>{content}</Badge>;
  }

  return content;
}
