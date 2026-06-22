import { useIsMobile, useIsXs } from "@/hooks/useBreakpoint";
import { useMemo } from "react";
import { buildDynamicFormLayoutFlags } from "../utils/dynamicFormLayout";
import type { DynamicFormLayoutFlags } from "../utils/dynamicFormLayout";

export function useDynamicFormLayout(): DynamicFormLayoutFlags {
  const isMobile = useIsMobile();
  const isXs = Boolean(useIsXs());

  return useMemo(
    () => buildDynamicFormLayoutFlags(isMobile, isXs),
    [isMobile, isXs],
  );
}
