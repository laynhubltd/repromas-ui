import React, { useState, useEffect } from "react";
import { Select, Flex } from "antd";
import type { SelectProps } from "antd";
import { useAppSelector } from "@/app/hooks";
import type { Level, LevelListParams, PaginatedResponse } from "@/features/settings/tabs/level-config/types/level";
import type { LevelCategory } from "@/features/settings/tabs/level-config/types/levelCategory";
import { useGetLevelsQuery, useGetLevelCategoriesQuery } from "@/features/settings/tabs/level-config/api/levelApi";

export type LevelQueryHook<TResult, TArg = LevelListParams> = (
  arg: TArg,
  options?: { skip?: boolean }
) => {
  data?: PaginatedResponse<TResult>;
  isLoading: boolean;
  isFetching?: boolean;
};

export interface LevelSelectProps extends Omit<SelectProps<number>, "options" | "loading"> {
  dataHooks?: {
    useCategoriesQuery: LevelQueryHook<LevelCategory>;
    useLevelsQuery: LevelQueryHook<Level>;
  };
  layout?: "horizontal" | "vertical";
}

function useLevelSelectionLogic({
  hasLevelCategory,
  dataHooks = { useLevelsQuery: useGetLevelsQuery, useCategoriesQuery: useGetLevelCategoriesQuery },
  value,
}: {
  hasLevelCategory: boolean;
  dataHooks?: LevelSelectProps["dataHooks"];
  value?: number | null;
}) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | undefined>(undefined);

  // If HAS_LEVEL_CATEGORY is false, fetch all levels
  const { data: allLevelsData, isLoading: isLoadingAllLevels } = dataHooks.useLevelsQuery(
    { itemsPerPage: 1000 },
    { skip: hasLevelCategory }
  );

  // If HAS_LEVEL_CATEGORY is true, fetch categories
  const { data: categoriesData, isLoading: isLoadingCategories } = dataHooks.useCategoriesQuery(
    { itemsPerPage: 1000 },
    { skip: !hasLevelCategory }
  );

  // If HAS_LEVEL_CATEGORY is true and a category is selected, fetch those levels
  const { data: categoryLevelsData, isLoading: isLoadingCategoryLevels, isFetching: isFetchingCategoryLevels } = dataHooks.useLevelsQuery(
    { "exact[category]": selectedCategoryId, itemsPerPage: 1000 },
    { skip: !hasLevelCategory || !selectedCategoryId }
  );

  // Auto-sync category when a value is initially provided
  const { data: initialLevelData } = dataHooks.useLevelsQuery(
    { itemsPerPage: 1000 },
    { skip: !hasLevelCategory || !value || !!selectedCategoryId }
  );

  useEffect(() => {
    if (hasLevelCategory && value && !selectedCategoryId && initialLevelData?.member?.length) {
      const level = initialLevelData.member.find((l) => l.id === value);
      if (level?.categoryId) {
        setSelectedCategoryId(level.categoryId);
      }
    }
  }, [hasLevelCategory, value, selectedCategoryId, initialLevelData]);

  // Derived state
  const categories = categoriesData?.member || [];
  
  let levels: Level[] = [];
  let isLoadingLevels = false;

  if (hasLevelCategory) {
    levels = categoryLevelsData?.member || [];
    isLoadingLevels = isLoadingCategories || isLoadingCategoryLevels || isFetchingCategoryLevels || false;
  } else {
    levels = allLevelsData?.member || [];
    isLoadingLevels = isLoadingAllLevels;
  }

  return {
    categories,
    levels,
    isLoadingLevels,
    isLoadingCategories,
    selectedCategoryId,
    setSelectedCategoryId,
  };
}

export const LevelSelect = React.forwardRef<any, LevelSelectProps>(
  ({ dataHooks, layout = "horizontal", value, onChange, status, ...rest }, ref) => {
    // 1. Read config
    const hasLevelCategory = useAppSelector((state) => state.systemConfig.configs.HAS_LEVEL_CATEGORY) === true;

    // 2. Use logic hook
    const {
      categories,
      levels,
      isLoadingLevels,
      isLoadingCategories,
      selectedCategoryId,
      setSelectedCategoryId,
    } = useLevelSelectionLogic({
      hasLevelCategory,
      dataHooks,
      value,
    });

    // 3. Render
    if (!hasLevelCategory) {
      return (
        <Select
          ref={ref}
          value={value}
          onChange={onChange}
          status={status}
          loading={isLoadingLevels}
          options={levels.map((l) => ({ label: l.name, value: l.id }))}
          {...rest}
        />
      );
    }

    const handleCategoryChange = (val: number) => {
      setSelectedCategoryId(val);
      if (onChange) {
        // Clear level value immediately when category changes
        onChange(undefined as any, []); 
      }
    };

    return (
      <Flex gap={8} align="center" vertical={layout === "vertical"} style={{ width: "100%" }}>
        <Select
          ref={ref}
          style={{ flex: 1 }}
          placeholder="Select Category"
          value={selectedCategoryId}
          onChange={handleCategoryChange}
          status={status}
          loading={isLoadingCategories}
          options={categories.map((c) => ({ label: c.name, value: c.id }))}
          allowClear
          onClear={() => handleCategoryChange(undefined as any)}
        />
        <Select
          style={{ flex: 1 }}
          placeholder="Select Level"
          value={value}
          onChange={onChange}
          status={status}
          loading={isLoadingLevels}
          disabled={!selectedCategoryId}
          options={levels.map((l) => ({ label: l.name, value: l.id }))}
          {...rest}
        />
      </Flex>
    );
  }
);
LevelSelect.displayName = "LevelSelect";
