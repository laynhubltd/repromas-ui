import { useCallback, useEffect, useRef, useState } from "react";
import { useGetLevelsQuery, useGetLevelCategoriesQuery } from "../api/levelApi";
import type { Level } from "../types/level";
import type { LevelCategory } from "../types/levelCategory";
import { useAppSelector } from "@/app/hooks";

export function useLevelConfigTab() {
  const hasLevelCategory = useAppSelector(
    (state) => state.systemConfig.configs.HAS_LEVEL_CATEGORY === true
  );

  // Level Category State
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categoryFormTarget, setCategoryFormTarget] = useState<LevelCategory | null>(null);
  const [deleteCategoryTarget, setDeleteCategoryTarget] = useState<LevelCategory | null>(null);
  const [categoryFormModalOpen, setCategoryFormModalOpen] = useState(false);

  // Level State
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [sort, setSort] = useState("rankOrder:asc");
  const [formTarget, setFormTarget] = useState<Level | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Level | null>(null);
  const [formModalOpen, setFormModalOpen] = useState(false);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(value), 300);
  }, []);

  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  // Fetch Categories if HAS_LEVEL_CATEGORY is true
  const {
    data: categoriesData,
    isLoading: categoriesLoading,
    isError: categoriesError,
    refetch: refetchCategories,
  } = useGetLevelCategoriesQuery(
    { itemsPerPage: 100 }, // Assume we want to load a sufficient amount
    { skip: !hasLevelCategory }
  );

  const levelCategories = categoriesData?.member ?? [];

  // Automatically select the first category if none is selected and data is available
  useEffect(() => {
    if (hasLevelCategory && levelCategories.length > 0 && selectedCategoryId === null) {
      setSelectedCategoryId(levelCategories[0].id);
    }
  }, [hasLevelCategory, levelCategories, selectedCategoryId]);

  // Query params for levels
  const queryParams = {
    page,
    itemsPerPage,
    sort,
    ...(debouncedSearch ? { "search[name]": debouncedSearch } : {}),
    ...(hasLevelCategory && selectedCategoryId ? { "exact[category]": selectedCategoryId } : {}),
  };

  // Only fetch levels if HAS_LEVEL_CATEGORY is false, OR if it's true and a category is selected
  const skipLevels = hasLevelCategory && selectedCategoryId === null;

  const {
    data: levelsData,
    isLoading: levelsLoading,
    isError: levelsError,
    refetch: refetchLevels,
  } = useGetLevelsQuery(queryParams, { skip: skipLevels });

  const levels = levelsData?.member ?? [];
  const totalItems = levelsData?.totalItems ?? 0;

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handlePageChange = useCallback((newPage: number, pageSize: number) => {
    setPage(newPage);
    setItemsPerPage(pageSize);
  }, []);

  // Level Modal Handlers
  const handleOpenCreateLevel = useCallback(() => {
    setFormTarget(null);
    setFormModalOpen(true);
  }, []);

  const handleOpenEditLevel = useCallback((level: Level) => {
    setFormTarget(level);
    setFormModalOpen(true);
  }, []);

  const handleOpenDeleteLevel = useCallback((level: Level) => {
    setDeleteTarget(level);
  }, []);

  const handleCloseLevelForm = useCallback(() => {
    setFormModalOpen(false);
    setFormTarget(null);
  }, []);

  const handleCloseDeleteLevel = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // Category Modal Handlers
  const handleOpenCreateCategory = useCallback(() => {
    setCategoryFormTarget(null);
    setCategoryFormModalOpen(true);
  }, []);

  const handleOpenEditCategory = useCallback((category: LevelCategory) => {
    setCategoryFormTarget(category);
    setCategoryFormModalOpen(true);
  }, []);

  const handleOpenDeleteCategory = useCallback((category: LevelCategory) => {
    setDeleteCategoryTarget(category);
  }, []);

  const handleCloseCategoryForm = useCallback(() => {
    setCategoryFormModalOpen(false);
    setCategoryFormTarget(null);
  }, []);

  const handleCloseDeleteCategory = useCallback(() => {
    setDeleteCategoryTarget(null);
  }, []);

  return {
    state: {
      hasLevelCategory,
      
      // Category state
      levelCategories,
      selectedCategoryId,
      categoriesLoading,
      categoriesError,
      categoryFormTarget,
      deleteCategoryTarget,
      categoryFormModalOpen,

      // Level state
      levels,
      totalItems,
      isLoading: levelsLoading,
      isError: levelsError,
      page,
      itemsPerPage,
      search,
      sort,
      formTarget,
      deleteTarget,
      formModalOpen,
    },
    actions: {
      setSelectedCategoryId,
      refetchCategories,
      handleOpenCreateCategory,
      handleOpenEditCategory,
      handleOpenDeleteCategory,
      handleCloseCategoryForm,
      handleCloseDeleteCategory,

      handleSearchChange,
      handleSortChange,
      handlePageChange,
      handleOpenCreateLevel,
      handleOpenEditLevel,
      handleOpenDeleteLevel,
      handleCloseLevelForm,
      handleCloseDeleteLevel,
      refetchLevels,
    },
    flags: {
      hasData: levels.length > 0,
      isSearchActive: search.trim().length > 0,
      hasCategories: levelCategories.length > 0,
    },
  };
}
