import { Select, Tag } from "antd";
import type { SelectProps } from "antd";
import React, { useEffect, useMemo } from "react";
import { useGetLevelSemestersQuery } from "@/features/settings/tabs/level-config/api/levelSemestersApi";
import type { LevelSemester } from "@/shared/types/level-semester";

export interface LevelSemesterSelectProps
  extends Omit<SelectProps<number>, "options" | "loading" | "onChange" | "value"> {
  levelId?: number | null;
  sessionId?: number | null;
  value?: number | null;
  /** Whether the dropdown value maps to concrete semester `id` or `semesterTypeId` (default: "id") */
  valueField?: "id" | "semesterTypeId";
  /** Automatically select the currently active semester (isCurrent = true) on load (default: false) */
  autoSelectCurrent?: boolean;
  onChange?: (value: number | null, option?: any) => void;
  onSemesterChange?: (semester: LevelSemester | null) => void;
  placeholder?: string;
  showCurrentTag?: boolean;
}

export const LevelSemesterSelect = React.forwardRef<any, LevelSemesterSelectProps>(
  (
    {
      levelId,
      sessionId,
      value,
      valueField = "id",
      autoSelectCurrent = false,
      onChange,
      onSemesterChange,
      placeholder = "Select semester",
      showCurrentTag = true,
      disabled = false,
      style,
      ...restProps
    },
    ref,
  ) => {
    const isLevelSelected = Boolean(levelId);

    const queryParams = useMemo(() => {
      if (!levelId) return undefined;
      return {
        ...(sessionId ? { "exact[sessionId]": sessionId } : {}),
        sort: "id:asc",
        itemsPerPage: 100,
      };
    }, [levelId, sessionId]);

    const { data, isLoading, isFetching } = useGetLevelSemestersQuery(
      { levelId: levelId!, params: queryParams },
      { skip: !isLevelSelected },
    );

    const semesters: LevelSemester[] = useMemo(
      () => data?.member ?? [],
      [data?.member],
    );

    // Auto-select current active semester if enabled and no value is selected
    useEffect(() => {
      if (
        !autoSelectCurrent ||
        (value !== undefined && value !== null) ||
        isLoading ||
        isFetching ||
        !semesters.length
      ) {
        return;
      }

      const currentSemester = semesters.find((s) => s.isCurrent) ?? semesters[0];
      if (currentSemester && onChange) {
        const targetVal =
          valueField === "semesterTypeId"
            ? currentSemester.semesterTypeId
            : currentSemester.id;
        onChange(targetVal);
        onSemesterChange?.(currentSemester);
      }
    }, [
      autoSelectCurrent,
      value,
      semesters,
      valueField,
      isLoading,
      isFetching,
      onChange,
      onSemesterChange,
    ]);

    const options = useMemo(() => {
      if (!semesters.length) return [];

      return semesters.map((sem) => {
        const val =
          valueField === "semesterTypeId" ? sem.semesterTypeId : sem.id;
        const primaryLabel =
          sem.ordinalName || sem.displayLabel || sem.semesterTypeName;

        return {
          value: val,
          semester: sem,
          label: (
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 8,
              }}
            >
              <span>{primaryLabel}</span>
              {showCurrentTag && sem.isCurrent && (
                <Tag
                  color="green"
                  style={{ margin: 0, fontSize: 11, lineHeight: "18px" }}
                >
                  Current
                </Tag>
              )}
            </span>
          ),
          searchValue: `${primaryLabel} ${sem.semesterTypeName} ${sem.ordinalName}`,
        };
      });
    }, [semesters, valueField, showCurrentTag]);

    const handleChange = (val: number | undefined, option: any) => {
      const selectedVal = val ?? null;
      onChange?.(selectedVal, option);
      if (onSemesterChange) {
        const matched =
          semesters.find((s) =>
            valueField === "semesterTypeId"
              ? s.semesterTypeId === selectedVal
              : s.id === selectedVal,
          ) ?? null;
        onSemesterChange(matched);
      }
    };

    if (!isLevelSelected) {
      return (
        <Select
          ref={ref}
          disabled
          placeholder="Select a level first…"
          value={undefined}
          style={{ width: "100%", ...style }}
          {...restProps}
        />
      );
    }

    return (
      <Select
        ref={ref}
        placeholder={placeholder}
        value={value ?? undefined}
        onChange={handleChange}
        options={options}
        loading={isLoading || isFetching}
        disabled={disabled || isLoading}
        allowClear
        showSearch
        optionFilterProp="searchValue"
        style={{ width: "100%", ...style }}
        {...restProps}
      />
    );
  },
);

LevelSemesterSelect.displayName = "LevelSemesterSelect";
