import { ExplainerCallout } from "@/components/ui-kit";
import { appPaths } from "@/app/routing/app-path";
import type { MatricNumberFormatPrerequisites } from "../types/matric-number-format";
import { MATRIC_NUMBER_FORMAT_UI_COPY } from "@/shared/constants/matricNumberFormatOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { Flex, Typography } from "antd";
import { Link } from "react-router-dom";
import { isMigrationPlaceholderCode, normalizeMatricPrerequisites } from "../utils/templateTokenHelpers";

type PrerequisitesBannerProps = {
  prerequisites: MatricNumberFormatPrerequisites | undefined;
  compact?: boolean;
};

export function PrerequisitesBanner({
  prerequisites,
  compact = false,
}: PrerequisitesBannerProps) {
  const token = useToken();

  if (!prerequisites) return null;

  const normalized = normalizeMatricPrerequisites(prerequisites)!;

  const programsNeedingCodes = normalized.programsMissingCode.filter(
    (p) => isMigrationPlaceholderCode(p.code) || !p.code?.trim(),
  );

  const isReady = normalized.ready;

  const detailBody = (
    <Flex vertical gap={8}>
      <ConditionalRenderer when={programsNeedingCodes.length > 0}>
        <div>
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            Programs missing real codes:
          </Typography.Text>
          <ul style={{ margin: `${token.paddingSM}px 0 0`, paddingLeft: 20 }}>
            {programsNeedingCodes.map((p) => (
              <li key={p.id}>
                <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                  {p.name}
                  {p.code ? ` (${p.code})` : ""} —{" "}
                  <Link to={appPaths.program}>Configure in Programs</Link>
                </Typography.Text>
              </li>
            ))}
          </ul>
        </div>
      </ConditionalRenderer>

      <ConditionalRenderer when={normalized.unparseableSessions.length > 0}>
        <div>
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }}>
            Sessions that cannot be parsed for year tokens:
          </Typography.Text>
          <ul style={{ margin: `${token.paddingSM}px 0 0`, paddingLeft: 20 }}>
            {normalized.unparseableSessions.map((s) => (
              <li key={s.id}>
                <Typography.Text style={{ fontSize: token.fontSizeSM }}>
                  {s.name} — check session name format in Academic Calendar
                </Typography.Text>
              </li>
            ))}
          </ul>
        </div>
      </ConditionalRenderer>

      <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
        Also ensure faculty and department codes are configured in{" "}
        <Link to={appPaths.academicStructure}>Academic Structure</Link> when using
        hierarchy tokens.
      </Typography.Text>
    </Flex>
  );

  return (
    <ExplainerCallout
      intent={isReady ? "tip" : "warning"}
      title={isReady ? "Ready to activate" : "Prerequisites need attention"}
      body={
        isReady ? (
          MATRIC_NUMBER_FORMAT_UI_COPY.prerequisitesReady
        ) : (
          <Flex vertical gap={8}>
            <Typography.Text style={{ fontSize: token.fontSizeSM }}>
              {MATRIC_NUMBER_FORMAT_UI_COPY.prerequisitesNotReady}
            </Typography.Text>
            <ConditionalRenderer when={!compact}>{detailBody}</ConditionalRenderer>
          </Flex>
        )
      }
      dismissible={false}
      collapsible={compact && !isReady}
      defaultCollapsed={compact}
    />
  );
}
