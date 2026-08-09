import { useAppSelector } from "@/app/hooks";
import type { ConfigKey } from "../types/system-config";

export function useSystemConfig<T = unknown>(key: ConfigKey): T | undefined {
  return useAppSelector((state) => state.systemConfig.configs[key] as T | undefined);
}

export function useSystemConfigState() {
  return useAppSelector((state) => state.systemConfig);
}
