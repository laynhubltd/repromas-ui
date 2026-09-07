import React from "react";
import { Alert, Button } from "antd";
import { WarningOutlined, ArrowRightOutlined } from "@ant-design/icons";
import type { IntakeAlertBannerProps } from "../types/dashboard";

export const IntakeAlertBanner: React.FC<IntakeAlertBannerProps> = ({
  noTransitionCount,
  onNavigateToTransitions,
}) => {
  if (noTransitionCount <= 0) return null;

  return (
    <Alert
      type="warning"
      showIcon
      icon={<WarningOutlined />}
      message={
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
          <span>
            <strong>Data Integrity Alert:</strong> {noTransitionCount.toLocaleString()}{" "}
            newly created {noTransitionCount === 1 ? "student is" : "students are"} pending intake enrollment transitions.
          </span>
          <Button
            type="primary"
            size="small"
            icon={<ArrowRightOutlined />}
            onClick={onNavigateToTransitions}
          >
            Run Intake Transitions
          </Button>
        </div>
      }
      style={{ width: "100%" }}
    />
  );
};
