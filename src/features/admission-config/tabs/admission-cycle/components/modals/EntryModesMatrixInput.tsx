import {
  ADMISSION_CYCLE_ENTRY_MODE_OPTIONS,
  ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS,
  ADMISSION_CYCLE_UI_COPY,
} from "@/shared/constants/admissionCycleOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { getAllowedIdentityModes } from "@/shared/utils/format/admissionCycleDisplay";
import { LockOutlined } from "@ant-design/icons";
import { Checkbox, Flex, Radio, Switch, Tag, Tooltip, Typography } from "antd";
import type {
  AdmissionCycleLaneConfig,
  AdmissionEntryMode,
  AdmissionIdentityMode,
} from "../../types/admission-cycle";

export type LaneLockInfo = {
  locked: boolean;
  count: number;
  isChecking: boolean;
};

type EntryModesMatrixInputProps = {
  value?: AdmissionCycleLaneConfig[];
  onChange?: (next: AdmissionCycleLaneConfig[]) => void;
  laneLocks: Record<AdmissionEntryMode, LaneLockInfo>;
};

const CANONICAL_ORDER: AdmissionEntryMode[] = ADMISSION_CYCLE_ENTRY_MODE_OPTIONS.map(
  (o) => o.value,
);

function sortByCanonicalOrder(
  lanes: AdmissionCycleLaneConfig[],
): AdmissionCycleLaneConfig[] {
  return [...lanes].sort(
    (a, b) =>
      CANONICAL_ORDER.indexOf(a.entryMode) -
      CANONICAL_ORDER.indexOf(b.entryMode),
  );
}

export function EntryModesMatrixInput({
  value = [],
  onChange,
  laneLocks,
}: EntryModesMatrixInputProps) {
  const token = useToken();

  const handleToggleLane = (
    entryMode: AdmissionEntryMode,
    checked: boolean,
  ) => {
    const lock = laneLocks[entryMode];
    if (!checked && lock.locked) return;

    if (checked) {
      if (value.some((l) => l.entryMode === entryMode)) return;
      const allowed = getAllowedIdentityModes(entryMode);
      const next = sortByCanonicalOrder([
        ...value,
        {
          entryMode,
          identityMode: allowed[0],
          enabled: true,
        },
      ]);
      onChange?.(next);
      return;
    }

    onChange?.(value.filter((l) => l.entryMode !== entryMode));
  };

  const handleIdentityChange = (
    entryMode: AdmissionEntryMode,
    identityMode: AdmissionIdentityMode,
  ) => {
    if (laneLocks[entryMode].locked) return;
    if (entryMode === "TRANSFER") return;

    onChange?.(
      value.map((lane) =>
        lane.entryMode === entryMode ? { ...lane, identityMode } : lane,
      ),
    );
  };

  const handleEnabledChange = (
    entryMode: AdmissionEntryMode,
    enabled: boolean,
  ) => {
    onChange?.(
      value.map((lane) =>
        lane.entryMode === entryMode ? { ...lane, enabled } : lane,
      ),
    );
  };

  return (
    <Flex vertical gap={8}>
      {ADMISSION_CYCLE_ENTRY_MODE_OPTIONS.map((opt) => {
        const lane = value.find((l) => l.entryMode === opt.value);
        const isConfigured = lane !== undefined;
        const lock = laneLocks[opt.value];
        const allowedIdentityModes = getAllowedIdentityModes(opt.value);
        const identityOptions = ADMISSION_CYCLE_IDENTITY_MODE_OPTIONS.filter(
          (idOpt) => allowedIdentityModes.includes(idOpt.value),
        );
        const isTransfer = opt.value === "TRANSFER";

        return (
          <div
            key={opt.value}
            style={{
              padding: token.paddingSM,
              borderRadius: token.borderRadius,
              border: `1px solid ${
                isConfigured ? token.colorPrimaryBorder : token.colorBorderSecondary
              }`,
              background: isConfigured
                ? token.colorBgContainer
                : token.colorBgLayout,
            }}
          >
            <Flex align="center" justify="space-between" wrap="wrap" gap={8}>
              <Flex align="center" gap={8}>
                <Checkbox
                  checked={isConfigured}
                  disabled={
                    lock.isChecking || (isConfigured && lock.locked)
                  }
                  onChange={(e) => handleToggleLane(opt.value, e.target.checked)}
                >
                  <Typography.Text strong>{opt.label}</Typography.Text>
                </Checkbox>

                <ConditionalRenderer when={lock.locked}>
                  <Tag icon={<LockOutlined />} color="default">
                    {ADMISSION_CYCLE_UI_COPY.laneLockedHint} ({lock.count})
                  </Tag>
                </ConditionalRenderer>
              </Flex>

              <ConditionalRenderer when={isConfigured}>
                <Flex align="center" gap={8}>
                  <Typography.Text
                    type="secondary"
                    style={{ fontSize: token.fontSizeSM }}
                  >
                    Accepting applications
                  </Typography.Text>
                  <Switch
                    size="small"
                    checked={lane?.enabled ?? false}
                    onChange={(checked) =>
                      handleEnabledChange(opt.value, checked)
                    }
                  />
                </Flex>
              </ConditionalRenderer>
            </Flex>

            <ConditionalRenderer when={isConfigured}>
              <div style={{ marginTop: 8, paddingLeft: 24 }}>
                <Tooltip
                  title={
                    isTransfer ? ADMISSION_CYCLE_UI_COPY.transferOpenOnlyHint : undefined
                  }
                >
                  <Radio.Group
                    value={lane?.identityMode}
                    disabled={lock.locked || isTransfer}
                    onChange={(e) =>
                      handleIdentityChange(
                        opt.value,
                        e.target.value as AdmissionIdentityMode,
                      )
                    }
                  >
                    {identityOptions.map((idOpt) => (
                      <Radio key={idOpt.value} value={idOpt.value}>
                        <Typography.Text>{idOpt.label}</Typography.Text>
                      </Radio>
                    ))}
                  </Radio.Group>
                </Tooltip>
              </div>
            </ConditionalRenderer>
          </div>
        );
      })}
    </Flex>
  );
}
