import type { AlertProps } from "antd";
import type { AriaRole } from "react";
import type { NotifierSeverity } from "./types";

interface NotifierSeverityMeta {
  antdType: NonNullable<AlertProps["type"]>;
  role: AriaRole;
  liveMode: "polite" | "assertive";
}

const NOTIFIER_SEVERITY_META: Record<NotifierSeverity, NotifierSeverityMeta> = {
  info: {
    antdType: "info",
    role: "status",
    liveMode: "polite",
  },
  success: {
    antdType: "success",
    role: "status",
    liveMode: "polite",
  },
  warning: {
    antdType: "warning",
    role: "alert",
    liveMode: "assertive",
  },
  error: {
    antdType: "error",
    role: "alert",
    liveMode: "assertive",
  },
};

export function getNotifierSeverityMeta(severity: NotifierSeverity = "info"): NotifierSeverityMeta {
  return NOTIFIER_SEVERITY_META[severity];
}
