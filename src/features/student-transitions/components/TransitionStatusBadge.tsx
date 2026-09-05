import type {
  SemanticKind,
  StateCategory,
} from "@/features/settings/tabs/student-transition-status/types/student-transition-status";
import {
  SEMANTIC_KIND_LABELS,
  getSemanticKindIcon,
} from "@/features/settings/tabs/student-transition-status/utils/semanticKindPresentation";
import { getStateCategoryColor } from "@/features/settings/tabs/student-transition-status/utils/stateCategoryColor";
import { useToken } from "@/shared/hooks/useToken";
import { InfoCircleOutlined } from "@ant-design/icons";
import { Flex, Popover, Tag, Typography } from "antd";
import React from "react";
import type { TransitionReason } from "../types/student-transition-evaluation";

export interface TransitionStatusBadgeProps {
  statusName: string;
  standingCategory: StateCategory;
  semanticKind?: SemanticKind;
  transitionReason?: TransitionReason | null;
  remark?: string | null;
}

const REASON_METADATA: Record<
  TransitionReason,
  { label: string; description: string; tagColor: string }
> = {
  EVALUATED: {
    label: "Standard Policy Evaluation",
    description: "Evaluated strictly within standard academic standing CGPA boundaries.",
    tagColor: "blue",
  },
  DEFERRED_CLAMP: {
    label: "Deferred Clamped Standing",
    description:
      "Terminal consequence deferred to session end — clamped to non-terminal academic standing.",
    tagColor: "orange",
  },
  SPILLOVER_RENEWAL: {
    label: "Spillover Renewal",
    description: "Student renewed spillover standing within allowed maximum residency years.",
    tagColor: "purple",
  },
  MANUAL_OVERRIDE: {
    label: "Administrative Override",
    description: "Status explicitly designated by manual administrative intervention.",
    tagColor: "magenta",
  },
  LAPSED_REGISTRATION: {
    label: "Lapsed Registration",
    description: "100% absence / 0 TCU recorded across registered courses (Absent Without Leave).",
    tagColor: "red",
  },
};

export function TransitionStatusBadge({
  statusName,
  standingCategory,
  semanticKind,
  transitionReason,
  remark,
}: TransitionStatusBadgeProps) {
  const token = useToken();
  const categoryColor = getStateCategoryColor(standingCategory, token);

  const reasonInfo = transitionReason ? REASON_METADATA[transitionReason] : null;

  const popoverContent = (
    <Flex vertical gap={8} style={{ maxWidth: 280 }}>
      {semanticKind && (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>
            Status Type
          </Typography.Text>
          <Flex align="center" gap={6} style={{ marginTop: 2 }}>
            {getSemanticKindIcon(semanticKind)}
            <Typography.Text strong style={{ fontSize: 12 }}>
              {SEMANTIC_KIND_LABELS[semanticKind]}
            </Typography.Text>
          </Flex>
        </div>
      )}
      {reasonInfo && (
        <div>
          <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>
            Transition Rule
          </Typography.Text>
          <Typography.Paragraph strong style={{ margin: 0 }}>
            {reasonInfo.label}
          </Typography.Paragraph>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {reasonInfo.description}
          </Typography.Text>
        </div>
      )}
      {remark && (
        <div style={{ marginTop: 4 }}>
          <Typography.Text type="secondary" style={{ fontSize: 11, textTransform: "uppercase" }}>
            Remarks
          </Typography.Text>
          <Typography.Paragraph style={{ margin: 0, fontSize: 12 }}>
            {remark}
          </Typography.Paragraph>
        </div>
      )}
    </Flex>
  );

  return (
    <Popover content={popoverContent} title="Standing Evaluation Detail" trigger="hover">
      <Tag
        style={{
          color: categoryColor,
          borderColor: categoryColor,
          background: token.colorBgContainer,
          fontWeight: 600,
          cursor: "pointer",
          display: "inline-flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        <span>{statusName}</span>
        {(reasonInfo || remark || semanticKind) && (
          <InfoCircleOutlined style={{ fontSize: 11, opacity: 0.7 }} />
        )}
      </Tag>
    </Popover>
  );
}
