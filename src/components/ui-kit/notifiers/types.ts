import type { ReactNode } from "react";

export type NotifierSeverity = "info" | "success" | "warning" | "error";
export type NotificationTrayMode = "flat" | "grouped";

export interface NotifierSlots {
  title: ReactNode;
  body?: ReactNode;
  icon?: ReactNode;
  timestamp?: ReactNode;
  action?: ReactNode;
}

export interface NotificationRecord extends NotifierSlots {
  id: string;
  severity?: NotifierSeverity;
  dismissible?: boolean;
  dismissLabel?: ReactNode;
  groupKey?: string;
  groupLabel?: ReactNode;
  onDismiss?: (id: string) => void;
}
