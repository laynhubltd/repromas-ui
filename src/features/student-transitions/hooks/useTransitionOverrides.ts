import { Modal } from "antd";
import { useCallback, useEffect, useRef, useState } from "react";
import type { StagedOverride } from "../types/student-transition-evaluation";

export function useTransitionOverrides(currentCohortKey: string | null) {
  const [overridesMap, setOverridesMap] = useState<Record<number, StagedOverride>>({});
  const previousCohortKeyRef = useRef<string | null>(currentCohortKey);

  // Monitor cohort key changes and warn / reset if overrides are staged
  useEffect(() => {
    if (previousCohortKeyRef.current && previousCohortKeyRef.current !== currentCohortKey) {
      const stagedCount = Object.keys(overridesMap).length;
      if (stagedCount > 0) {
        Modal.warning({
          title: "Cohort Filter Changed",
          content: `You had ${stagedCount} staged manual override(s) for the previous cohort. Staged overrides have been cleared to prevent cross-cohort override conflicts.`,
          okText: "Acknowledged",
        });
        setOverridesMap({});
      }
    }
    previousCohortKeyRef.current = currentCohortKey;
  }, [currentCohortKey, overridesMap]);

  const setOverride = useCallback((override: StagedOverride) => {
    setOverridesMap((prev) => ({
      ...prev,
      [override.studentId]: override,
    }));
  }, []);

  const removeOverride = useCallback((studentId: number) => {
    setOverridesMap((prev) => {
      const next = { ...prev };
      delete next[studentId];
      return next;
    });
  }, []);

  const clearAllOverrides = useCallback(() => {
    setOverridesMap({});
  }, []);

  const getPayloadOverrides = useCallback((): Record<number, number> => {
    const payload: Record<number, number> = {};
    for (const [idStr, entry] of Object.entries(overridesMap)) {
      payload[Number(idStr)] = entry.targetStatusId;
    }
    return payload;
  }, [overridesMap]);

  const stagedCount = Object.keys(overridesMap).length;

  return {
    overridesMap,
    stagedCount,
    setOverride,
    removeOverride,
    clearAllOverrides,
    getPayloadOverrides,
  };
}
