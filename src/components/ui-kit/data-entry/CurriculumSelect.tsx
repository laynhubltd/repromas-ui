import React, { useEffect, useMemo } from "react";
import { Select, Tag } from "antd";
import type { SelectProps } from "antd";
import { useGetCurriculumVersionsQuery } from "@/features/settings/tabs/curriculum-version/api/curriculumVersionApi";
import type {
  CurriculumScope,
  CurriculumVersion,
} from "@/features/settings/tabs/curriculum-version/types/curriculum-version";

export interface CurriculumSelectProps
  extends Omit<SelectProps<number>, "options" | "loading" | "onChange" | "value"> {
  /** Filter curriculum versions to those applicable for a specific program */
  programId?: number | null;
  /** Currently selected version ID */
  value?: number | null;
  /** Selection change handler */
  onChange?: (value: number | null, option?: any) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Show 'Active' tag badge on active versions (default: true) */
  showActiveBadge?: boolean;
  /** Show 'Program' / 'Global' scope tag badge (default: true) */
  showScopeBadge?: boolean;
  /** Scope filter: 'ALL' | 'GLOBAL' | 'PROGRAM' */
  scopeFilter?: "ALL" | CurriculumScope;
  /** Auto-select the active version using hierarchical priority cascade (default: false) */
  autoSelectActive?: boolean;
  /** Skip the query (e.g. when enclosing modal is not open) */
  skip?: boolean;
}

export const CurriculumSelect = React.forwardRef<any, CurriculumSelectProps>(
  (
    {
      programId,
      value,
      onChange,
      placeholder = "Select curriculum version",
      showActiveBadge = true,
      showScopeBadge = true,
      scopeFilter = "ALL",
      autoSelectActive = false,
      skip = false,
      disabled = false,
      style,
      ...restProps
    },
    ref,
  ) => {
    const queryParams = useMemo(() => {
      return programId
        ? { forProgramId: programId, include: "program", itemsPerPage: 200 }
        : { itemsPerPage: 200 };
    }, [programId]);

    const { data, isLoading, isFetching } = useGetCurriculumVersionsQuery(
      queryParams,
      { skip },
    );

    const rawVersions: CurriculumVersion[] = useMemo(() => {
      if (!data) return [];
      if (Array.isArray(data)) return data;
      return data.member ?? [];
    }, [data]);

    // Apply optional scope filter
    const versions = useMemo(() => {
      if (scopeFilter === "ALL") return rawVersions;
      return rawVersions.filter((v) => v.scope === scopeFilter);
    }, [rawVersions, scopeFilter]);

    // Auto-select active version using priority cascade
    useEffect(() => {
      if (!autoSelectActive || (value !== undefined && value !== null) || isLoading || isFetching || !versions.length) {
        return;
      }

      const programActive = programId
        ? versions.find(
            (v) =>
              v.scope === "PROGRAM" &&
              v.referenceId === programId &&
              v.isActiveForAdmission,
          )
        : null;

      const globalActive = versions.find(
        (v) => v.scope === "GLOBAL" && v.isActiveForAdmission,
      );

      const anyActive = versions.find((v) => v.isActiveForAdmission);

      const targetVersion = programActive ?? globalActive ?? anyActive;
      if (targetVersion && onChange) {
        onChange(targetVersion.id);
      }
    }, [autoSelectActive, value, versions, programId, isLoading, isFetching, onChange]);

    const options = useMemo(() => {
      return versions.map((v) => {
        const activeTag = v.isActiveForAdmission ? "Active" : null;
        const scopeTag = v.scope === "PROGRAM" ? "Program" : "Global";
        const tags = [showActiveBadge && activeTag, showScopeBadge && scopeTag]
          .filter(Boolean)
          .join(" • ");

        return {
          value: v.id,
          label: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span>{v.name}</span>
              <span style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                {showScopeBadge && (
                  <Tag
                    color={v.scope === "PROGRAM" ? "blue" : "purple"}
                    style={{ margin: 0, fontSize: 10, lineHeight: "16px" }}
                  >
                    {v.scope === "PROGRAM" ? "Program" : "Global"}
                  </Tag>
                )}
                {showActiveBadge && v.isActiveForAdmission && (
                  <Tag
                    color="green"
                    style={{ margin: 0, fontSize: 10, lineHeight: "16px" }}
                  >
                    Active
                  </Tag>
                )}
              </span>
            </span>
          ),
          searchValue: `${v.name} ${tags}`,
          title: tags ? `${v.name} (${tags})` : v.name,
        };
      });
    }, [versions, showActiveBadge, showScopeBadge]);

    return (
      <Select
        ref={ref}
        placeholder={placeholder}
        value={value ?? undefined}
        onChange={(val, opt) => onChange?.(val ?? null, opt)}
        options={options}
        loading={isLoading || isFetching}
        disabled={disabled || isLoading}
        allowClear
        showSearch
        optionFilterProp="searchValue"
        filterOption={(input, option) =>
          String(option?.searchValue ?? "")
            .toLowerCase()
            .includes(input.toLowerCase())
        }
        style={{ width: "100%", height: 40, ...style }}
        {...restProps}
      />
    );
  },
);

CurriculumSelect.displayName = "CurriculumSelect";
