/**
 * Internal helper — maps ExplainerIntent to an Ant Design icon.
 * Kept in its own file so it can be shared across Callout, Tooltip, Spotlight.
 */
import {
    BulbOutlined,
    ExperimentOutlined,
    InfoCircleOutlined,
    StarOutlined,
    WarningOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { ExplainerIntent } from "./types";

export function getIntentIcon(intent: ExplainerIntent): ReactNode {
  switch (intent) {
    case "tip":
      return <BulbOutlined />;
    case "warning":
      return <WarningOutlined />;
    case "new":
      return <StarOutlined />;
    case "beta":
      return <ExperimentOutlined />;
    case "info":
    default:
      return <InfoCircleOutlined />;
  }
}
