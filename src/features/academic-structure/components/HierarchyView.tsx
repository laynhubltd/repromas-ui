// Feature: faculty-department-management
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { ConditionalRenderer, centeredBox } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Pagination, Typography } from "antd";
import { useHierarchyView } from "../hooks/useHierarchyView";
import { FacultyRow } from "./FacultyRow";
import { FacultySearchBar } from "./FacultySearchBar";
import { DeleteFacultyModal } from "./modals/DeleteFacultyModal";
import { DepartmentFormModal } from "./modals/DepartmentFormModal";
import { FacultyFormModal } from "./modals/FacultyFormModal";

export function HierarchyView() {
  const token = useToken();
  const { state, actions, flags } = useHierarchyView();
  const {
    faculties,
    totalItems,
    isLoading,
    isError,
    page,
    itemsPerPage,
    nameSearch,
    codeSearch,
    sort,
    expandedIds,
    createModalOpen,
    editTarget,
    deleteTarget,
    addDeptTarget,
  } = state;
  const {
    handleNameSearchChange,
    handleCodeSearchChange,
    handleSortChange,
    handlePageChange,
    handleToggleExpand,
    handleOpenCreate,
    handleOpenEdit,
    handleOpenDelete,
    handleOpenAddDept,
    handleCloseCreate,
    handleCloseEdit,
    handleCloseDelete,
    handleCloseAddDept,
    refetch,
  } = actions;
  const { hasData, isSearchActive } = flags;

  return (
    <div>
      {/* Header row: title + Create Faculty button */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <Typography.Title level={5} style={{ margin: 0 }}>
          Faculties
        </Typography.Title>
        <PermissionGuard permission={Permission.FacultiesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            style={{ fontWeight: 600 }}
          >
            Create Faculty
          </Button>
        </PermissionGuard>
      </div>

      {/* Search bar */}
      <FacultySearchBar
        nameSearch={nameSearch}
        codeSearch={codeSearch}
        sort={sort}
        onNameChange={handleNameSearchChange}
        onCodeChange={handleCodeSearchChange}
        onSortChange={handleSortChange}
      />

      {/* Faculty list area */}
      <div style={{ marginTop: 12 }}>
        <DataLoader
          loading={isLoading}
          loader={<SkeletonRows count={3} variant="card" />}
        >
          {/* Error state */}
          <ConditionalRenderer when={isError}>
            <ErrorAlert
              variant="section"
              error="Failed to load faculties"
              onRetry={refetch}
            />
          </ConditionalRenderer>

          {/* Empty state — no search active */}
          <ConditionalRenderer
            when={!isError && !hasData && !isSearchActive}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text type="secondary" style={{ display: "block", marginBottom: 16 }}>
              No faculties yet. Create your first faculty to get started.
            </Typography.Text>
            <PermissionGuard permission={Permission.FacultiesCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                style={{ fontWeight: 600 }}
              >
                Create Faculty
              </Button>
            </PermissionGuard>
          </ConditionalRenderer>

          {/* Empty state — search active but no results */}
          <ConditionalRenderer
            when={!isError && !hasData && isSearchActive}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text type="secondary" style={{ display: "block", marginBottom: 8 }}>
              No faculties found matching your search.
            </Typography.Text>
            <Button
              type="link"
              onClick={() => {
                handleNameSearchChange("");
                handleCodeSearchChange("");
              }}
            >
              Clear search
            </Button>
          </ConditionalRenderer>

          {/* Faculty rows */}
          <ConditionalRenderer when={!isError && hasData}>
            {faculties.map((faculty) => (
              <FacultyRow
                key={faculty.id}
                faculty={faculty}
                isExpanded={expandedIds.has(faculty.id)}
                onToggleExpand={handleToggleExpand}
                onEdit={handleOpenEdit}
                onDelete={handleOpenDelete}
                onAddDepartment={handleOpenAddDept}
              />
            ))}
          </ConditionalRenderer>
        </DataLoader>
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalItems > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Pagination
            current={page}
            pageSize={itemsPerPage}
            total={totalItems}
            showSizeChanger
            onChange={handlePageChange}
            onShowSizeChange={handlePageChange}
          />
        </div>
      )}

      {/* Faculty modals */}
      <FacultyFormModal
        open={createModalOpen || editTarget !== null}
        target={editTarget}
        onClose={editTarget !== null ? handleCloseEdit : handleCloseCreate}
      />
      <DeleteFacultyModal
        open={deleteTarget !== null}
        target={deleteTarget}
        onClose={handleCloseDelete}
      />

      {/* Department form modal — triggered from faculty row "Add Department" */}
      {addDeptTarget !== null && (
        <DepartmentFormModal
          open
          target={null}
          facultyId={addDeptTarget.id}
          facultyName={addDeptTarget.name}
          onClose={handleCloseAddDept}
        />
      )}
    </div>
  );
}
