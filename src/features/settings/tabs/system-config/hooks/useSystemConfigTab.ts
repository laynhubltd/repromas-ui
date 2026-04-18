// Feature: system-config
import { useGetProgramsQuery } from "@/features/program/tabs/programs/api/programsApi";
import { useMemo, useState } from "react";
import { useListSystemConfigsQuery } from "../api/systemConfigApi";
import type {
    ConfigKey,
    ConfigScope,
    MissingConfigProgram,
    ProgramOption,
    SystemConfig,
} from "../types/system-config";

// ── Pure functions (exported for independent testability) ─────────────────────

export function computeMetrics(configs: SystemConfig[]): {
  totalConfigs: number;
  programsConfigured: number;
} {
  const totalConfigs = configs.length;
  const programsConfigured = new Set(
    configs
      .filter(
        (c) =>
          c.scope === "PROGRAM" &&
          c.configKey === "CREDIT_LOAD_LIMITS" &&
          c.referenceId !== null,
      )
      .map((c) => c.referenceId),
  ).size;
  return { totalConfigs, programsConfigured };
}

export function detectMissingPrograms(
  configs: SystemConfig[],
  programs: ProgramOption[],
): MissingConfigProgram[] {
  const programsWithAnyConfig = new Set(
    configs
      .filter((c) => c.scope === "PROGRAM" && c.referenceId !== null)
      .map((c) => c.referenceId),
  );
  const programsWithCreditLimits = new Set(
    configs
      .filter(
        (c) =>
          c.scope === "PROGRAM" &&
          c.configKey === "CREDIT_LOAD_LIMITS" &&
          c.referenceId !== null,
      )
      .map((c) => c.referenceId),
  );
  return [...programsWithAnyConfig]
    .filter((id) => !programsWithCreditLimits.has(id))
    .map((id) => ({
      referenceId: id as number,
      programName: programs.find((p) => p.id === id)?.name ?? `ID: ${id}`,
    }));
}

export function filterConfigs(
  configs: SystemConfig[],
  configKeyFilter: ConfigKey | undefined,
  scopeFilter: ConfigScope | undefined,
): SystemConfig[] {
  return configs.filter(
    (c) =>
      (!configKeyFilter || c.configKey === configKeyFilter) &&
      (!scopeFilter || c.scope === scopeFilter),
  );
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useSystemConfigTab() {
  // ── Modal state ────────────────────────────────────────────────────────────

  const [formTarget, setFormTarget] = useState<SystemConfig | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<SystemConfig | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // ── Filter state ───────────────────────────────────────────────────────────

  const [configKeyFilter, setConfigKeyFilter] = useState<ConfigKey | undefined>(undefined);
  const [scopeFilter, setScopeFilter] = useState<ConfigScope | undefined>(undefined);

  // ── Queries ────────────────────────────────────────────────────────────────

  const {
    data: configsData,
    isLoading: configsLoading,
    isError: configsError,
    refetch,
  } = useListSystemConfigsQuery();

  const { data: programsData, isLoading: programsLoading } = useGetProgramsQuery({
    itemsPerPage: 200,
    sort: "name:asc",
  });

  const configs: SystemConfig[] = configsData?.member ?? [];
  const programs: ProgramOption[] = useMemo(
    () => (programsData?.member ?? []).map((p) => ({ id: p.id, name: p.name })),
    [programsData],
  );

  // ── Derived computations ───────────────────────────────────────────────────

  const { totalConfigs, programsConfigured } = useMemo(
    () => computeMetrics(configs),
    [configs],
  );

  const missingPrograms = useMemo(
    () => detectMissingPrograms(configs, programs),
    [configs, programs],
  );

  const filteredConfigs = useMemo(
    () => filterConfigs(configs, configKeyFilter, scopeFilter),
    [configs, configKeyFilter, scopeFilter],
  );

  const activeFilterCount = (configKeyFilter ? 1 : 0) + (scopeFilter ? 1 : 0);

  // ── Action handlers ────────────────────────────────────────────────────────

  const handleOpenCreate = () => {
    setFormTarget(null);
    setFormModalOpen(true);
  };

  const handleOpenEdit = (config: SystemConfig) => {
    setFormTarget(config);
    setFormModalOpen(true);
  };

  const handleOpenDelete = (config: SystemConfig) => {
    setDeleteTarget(config);
    setDeleteModalOpen(true);
  };

  const handleCloseForm = () => {
    setFormModalOpen(false);
    setFormTarget(null);
  };

  const handleCloseDelete = () => {
    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleConfigKeyFilterChange = (value: ConfigKey | undefined) => {
    setConfigKeyFilter(value);
  };

  const handleScopeFilterChange = (value: ConfigScope | undefined) => {
    setScopeFilter(value);
  };

  const handleClearFilters = () => {
    setConfigKeyFilter(undefined);
    setScopeFilter(undefined);
  };

  // ── Return shape ───────────────────────────────────────────────────────────

  return {
    state: {
      configs,
      programs,
      isLoading: configsLoading,
      isError: configsError,
      programsLoading,
      formTarget,
      deleteTarget,
      formModalOpen,
      deleteModalOpen,
      totalConfigs,
      programsConfigured,
      missingPrograms,
      configKeyFilter,
      scopeFilter,
      activeFilterCount,
      filteredConfigs,
    },
    actions: {
      handleOpenCreate,
      handleOpenEdit,
      handleOpenDelete,
      handleCloseForm,
      handleCloseDelete,
      handleConfigKeyFilterChange,
      handleScopeFilterChange,
      handleClearFilters,
      refetch,
    },
    flags: {
      hasConfigs: configs.length > 0,
      isFiltering: activeFilterCount > 0,
      showWarning: missingPrograms.length > 0,
    },
  };
}
