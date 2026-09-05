// Feature: level-config
import { ExplainerCallout } from "@/components/ui-kit";
import { useToken } from "@/shared/hooks/useToken";
import { Col, Flex, Grid, Row } from "antd";
import { useLevelConfigTab } from "../hooks/useLevelConfigTab";
import { LevelCategoryPanel } from "./LevelCategoryPanel";
import { LevelPanel } from "./LevelPanel";
import { DeleteLevelCategoryModal } from "./modals/DeleteLevelCategoryModal";
import { DeleteLevelModal } from "./modals/DeleteLevelModal";
import { LevelCategoryFormModal } from "./modals/LevelCategoryFormModal";
import { LevelFormModal } from "./modals/LevelFormModal";

const { useBreakpoint } = Grid;

export function LevelConfigTab() {
  const token = useToken();
  const screens = useBreakpoint();
  const isDesktop = !!screens.md;

  const { state, actions, flags } = useLevelConfigTab();

  const {
    hasLevelCategory,
    levelCategories,
    selectedCategoryId,
    categoriesLoading,
    categoriesError,
    categoryFormTarget,
    deleteCategoryTarget,
    categoryFormModalOpen,
    levels,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    search,
    formTarget,
    deleteTarget,
    formModalOpen,
  } = state;

  const {
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
  } = actions;

  const { hasData, isSearchActive } = flags;

  return (
    <>
      <Flex vertical gap={30}>
        <ExplainerCallout
          intent="new"
          title="Levels"
          body={
            hasLevelCategory
              ? "Academic levels define the progression order for students. With Level Categories enabled, levels are grouped by category (e.g. ND, HND) and rank orders are scoped to their respective category."
              : "Academic levels define the progression order for students. The rank order controls the advancement sequence across your institution."
          }
          dismissible
          collapsible
        />

        <Row gutter={[0, 24]}>
          {/* Left panel — LevelCategory (only rendered if hasLevelCategory is true) */}
          {hasLevelCategory && (
            <Col
              xs={24}
              md={9}
              style={
                isDesktop
                  ? {
                      borderRight: `1px solid ${token.colorBorderSecondary}`,
                      paddingRight: token.marginXL,
                    }
                  : undefined
              }
            >
              <LevelCategoryPanel
                categories={levelCategories}
                isLoading={categoriesLoading}
                isError={categoriesError}
                selectedCategoryId={selectedCategoryId}
                onSelectCategory={setSelectedCategoryId}
                refetchCategories={refetchCategories}
                onOpenCreate={handleOpenCreateCategory}
                onOpenEdit={handleOpenEditCategory}
                onOpenDelete={handleOpenDeleteCategory}
              />
            </Col>
          )}

          {/* Right panel — Levels */}
          <Col 
            xs={24} 
            md={hasLevelCategory ? 15 : 24}
            style={
              isDesktop && hasLevelCategory
                ? { paddingLeft: token.marginXL }
                : undefined
            }
          >
            <LevelPanel
              levels={levels}
              totalItems={totalItems}
              isLoading={isLoading}
              isError={isError}
              page={page}
              itemsPerPage={itemsPerPage}
              search={search}
              onSearchChange={handleSearchChange}
              onSortChange={handleSortChange}
              onPageChange={handlePageChange}
              onOpenCreate={handleOpenCreateLevel}
              onOpenEdit={handleOpenEditLevel}
              onOpenDelete={handleOpenDeleteLevel}
              refetchLevels={refetchLevels}
              hasData={hasData}
              isSearchActive={isSearchActive}
              hasLevelCategory={hasLevelCategory}
              selectedCategoryId={selectedCategoryId}
            />
          </Col>
        </Row>
      </Flex>

      {/* Modals */}
      <LevelFormModal
        open={formModalOpen}
        target={formTarget}
        onClose={handleCloseLevelForm}
        hasLevelCategory={hasLevelCategory}
        selectedCategoryId={selectedCategoryId}
        categories={levelCategories}
      />
      <DeleteLevelModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDeleteLevel}
      />

      {/* Category Modals */}
      <LevelCategoryFormModal
        open={categoryFormModalOpen}
        target={categoryFormTarget}
        onClose={handleCloseCategoryForm}
      />
      <DeleteLevelCategoryModal
        open={deleteCategoryTarget !== null}
        target={deleteCategoryTarget}
        onClose={handleCloseDeleteCategory}
      />
    </>
  );
}
