import { DashCard, ExplainerCallout } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { useToken } from "@/shared/hooks/useToken";
import { JAMB_SCOPE_OPTIONS } from "@/shared/constants/jambRuleOptions";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  DeleteOutlined,
  EditOutlined,
  FilterOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Col,
  Flex,
  Form,
  Input,
  Pagination,
  Popover,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";
import { useState } from "react";
import { useJambRuleTab } from "../hooks/useJambRuleTab";
import { resolveReferenceLabel } from "../utils/resolveReferenceLabel";
import { JambRuleBanner } from "./JambRuleBanner";
import { JambRuleDetailBuilder } from "./JambRuleDetailBuilder";
import { CombinationFormModal } from "./modals/CombinationFormModal";
import { DeleteCombinationModal } from "./modals/DeleteCombinationModal";
import { DeleteGroupModal } from "./modals/DeleteGroupModal";
import { DeleteOptionModal } from "./modals/DeleteOptionModal";
import { GroupFormModal } from "./modals/GroupFormModal";
import { OptionFormModal } from "./modals/OptionFormModal";

const scopeTagColor: Record<string, string> = {
  GLOBAL: "blue",
  FACULTY: "purple",
  DEPARTMENT: "orange",
  PROGRAM: "green",
};

export function JambRuleTab() {
  const token = useToken();
  const [filterPopoverOpen, setFilterPopoverOpen] = useState(false);

  const { state, actions, flags } = useJambRuleTab();
  const {
    combinations,
    totalItems,
    hasGlobalRule,
    selectedCombination,
    selectedCombinationId,
    groups,
    isGroupsLoading,
    isGroupsError,
    faculties,
    departments,
    programs,
    isLoading,
    isError,
    search,
    scopeFilter,
    page,
    combinationFormTarget,
    combinationFormOpen,
    deleteCombinationTarget,
    groupFormTarget,
    groupFormOpen,
    deleteGroupTarget,
    optionFormTarget,
    optionFormPresetGroupId,
    optionFormOpen,
    deleteOptionTarget,
    activeFilterCount,
    optionFormExcludedSubjectIds,
    groupFormExistingOptionCount,
    optionFormGroupContext,
  } = state;
  const {
    handleSearchChange,
    handleScopeFilterChange,
    handlePageChange,
    handleSelectCombination,
    handleClearFilters,
    handleOpenCreateCombination,
    handleOpenEditCombination,
    handleCloseCombinationForm,
    handleOpenDeleteCombination,
    handleCloseDeleteCombination,
    handleOpenCreateGroup,
    handleOpenEditGroup,
    handleCloseGroupForm,
    handleOpenDeleteGroup,
    handleCloseDeleteGroup,
    handleOpenCreateOption,
    handleOpenEditOption,
    handleCloseOptionForm,
    handleOpenDeleteOption,
    handleCloseDeleteOption,
    refetch,
  } = actions;
  const { hasData, isSearchOrFilterActive } = flags;

  const totalGroups = groups.length;

  const filterContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Scope" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any scope"
            allowClear
            value={scopeFilter}
            onChange={handleScopeFilterChange}
            style={{ width: "100%" }}
            options={JAMB_SCOPE_OPTIONS}
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={handleClearFilters}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  const handleCombinationCreated = (created: { id: number }) => {
    handleSelectCombination(created.id);
  };

  const cardState = isLoading ? "loading" : "default";

  return (
    <Flex vertical gap={24} style={{ width: "100%" }}>
      <JambRuleBanner />

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Total Combinations"
            value={totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Global Fallback"
            value={hasGlobalRule ? "Configured" : "Missing"}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <DashCard
            title="Groups (Selected Rule)"
            value={selectedCombination ? totalGroups : "—"}
            state={selectedCombination && isGroupsLoading ? "loading" : cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <ConditionalRenderer when={!hasGlobalRule && !isSearchOrFilterActive}>
        <ExplainerCallout
          intent="warning"
          collapsible
          title="No GLOBAL fallback configured"
          body="Create a GLOBAL combination as institution default so programs without a specific JAMB rule still have subject requirements at screening."
        />
      </ConditionalRenderer>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search combinations by name…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            allowClear
            style={{ maxWidth: 320, flex: 1, minWidth: 200 }}
          />

          <Popover
            content={filterContent}
            title={
              <span>
                <FilterOutlined /> Filters
              </span>
            }
            trigger="click"
            open={filterPopoverOpen}
            onOpenChange={setFilterPopoverOpen}
            placement="bottomLeft"
            arrow={false}
          >
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                type={activeFilterCount > 0 ? "primary" : "default"}
              >
                Filters
              </Button>
            </Badge>
          </Popover>
        </Flex>

        <PermissionGuard permission={Permission.AdmissionJambRulesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreateCombination}
            style={{ fontWeight: 600 }}
          >
            Create Combination
          </Button>
        </PermissionGuard>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={10}>
          <div
            style={{
              border: `1px solid ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
              padding: 16,
            }}
          >
            <Typography.Text strong style={{ display: "block", marginBottom: 12 }}>
              Combinations
            </Typography.Text>

            <DataLoader
              loading={isLoading}
              loader={<SkeletonRows count={4} variant="inline" />}
            >
              <ConditionalRenderer when={isError}>
                <ErrorAlert
                  variant="section"
                  error="Failed to load JAMB combinations."
                  onRetry={refetch}
                />
              </ConditionalRenderer>

              <ConditionalRenderer
                when={!isError && !hasData && !isSearchOrFilterActive}
                wrapper={centeredBox({
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgLayout,
                })}
              >
                <Typography.Text
                  type="secondary"
                  style={{ display: "block", marginBottom: 16, textAlign: "center" }}
                >
                  No JAMB combinations configured yet. Start with a GLOBAL fallback,
                  then add program-specific rules.
                </Typography.Text>
                <PermissionGuard permission={Permission.AdmissionJambRulesCreate}>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={handleOpenCreateCombination}
                  >
                    Create Combination
                  </Button>
                </PermissionGuard>
              </ConditionalRenderer>

              <ConditionalRenderer
                when={!isError && !hasData && isSearchOrFilterActive}
                wrapper={centeredBox({
                  border: `1px dashed ${token.colorBorder}`,
                  borderRadius: token.borderRadius,
                  background: token.colorBgLayout,
                })}
              >
                <Typography.Text type="secondary">
                  No results match your search or filters.
                </Typography.Text>
                <Button type="link" onClick={handleClearFilters}>
                  Clear filters
                </Button>
              </ConditionalRenderer>

              <ConditionalRenderer when={!isError && hasData}>
                <Flex vertical gap={8}>
                  {combinations.map((combination) => {
                    const isSelected = combination.id === selectedCombinationId;
                    return (
                      <Flex
                        key={combination.id}
                        align="flex-start"
                        justify="space-between"
                        gap={8}
                        onClick={() => handleSelectCombination(combination.id)}
                        style={{
                          padding: 12,
                          borderRadius: token.borderRadius,
                          border: `1px solid ${isSelected ? token.colorPrimary : token.colorBorderSecondary}`,
                          background: isSelected
                            ? token.colorBgLayout
                            : token.colorBgContainer,
                          cursor: "pointer",
                        }}
                      >
                        <Flex vertical gap={4} flex={1}>
                          <Flex gap={8} align="center" wrap="wrap">
                            <Typography.Text strong={isSelected}>
                              {combination.name}
                            </Typography.Text>
                            <Tag color={scopeTagColor[combination.scope] ?? "default"}>
                              {combination.scope}
                            </Tag>
                          </Flex>
                          <Typography.Text
                            type="secondary"
                            style={{ fontSize: token.fontSizeSM }}
                          >
                            {resolveReferenceLabel(
                              combination.scope,
                              combination.referenceId,
                              faculties,
                              departments,
                              programs,
                            )}{" "}
                            · Weight {combination.priorityWeight}
                          </Typography.Text>
                        </Flex>
                        <Flex gap={4} onClick={(e) => e.stopPropagation()}>
                          <PermissionGuard permission={Permission.AdmissionJambRulesUpdate}>
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleOpenEditCombination(combination)}
                            />
                          </PermissionGuard>
                          <PermissionGuard permission={Permission.AdmissionJambRulesDelete}>
                            <Button
                              type="text"
                              size="small"
                              danger
                              icon={<DeleteOutlined />}
                              onClick={() => handleOpenDeleteCombination(combination)}
                            />
                          </PermissionGuard>
                        </Flex>
                      </Flex>
                    );
                  })}
                </Flex>
              </ConditionalRenderer>
            </DataLoader>

            <ConditionalRenderer when={!isError && totalItems > 30}>
              <Flex justify="flex-end" style={{ marginTop: 12 }}>
                <Pagination
                  current={page}
                  pageSize={30}
                  total={totalItems}
                  onChange={handlePageChange}
                  showSizeChanger={false}
                  size="small"
                />
              </Flex>
            </ConditionalRenderer>
          </div>
        </Col>

        <Col xs={24} lg={14}>
          <JambRuleDetailBuilder
            combination={selectedCombination}
            groups={groups}
            isLoading={isGroupsLoading}
            isError={isGroupsError}
            faculties={faculties}
            departments={departments}
            programs={programs}
            onAddGroup={handleOpenCreateGroup}
            onEditGroup={handleOpenEditGroup}
            onDeleteGroup={handleOpenDeleteGroup}
            onAddOption={handleOpenCreateOption}
            onEditOption={handleOpenEditOption}
            onDeleteOption={handleOpenDeleteOption}
            onRetry={refetch}
          />
        </Col>
      </Row>

      <CombinationFormModal
        open={combinationFormOpen}
        target={combinationFormTarget}
        onClose={handleCloseCombinationForm}
        onCreated={handleCombinationCreated}
      />
      <DeleteCombinationModal
        open={deleteCombinationTarget !== null}
        target={deleteCombinationTarget}
        onClose={handleCloseDeleteCombination}
        onDeleted={() => handleSelectCombination(null)}
      />
      <GroupFormModal
        open={groupFormOpen}
        target={groupFormTarget}
        combinationId={selectedCombinationId}
        existingOptionCount={groupFormExistingOptionCount}
        onClose={handleCloseGroupForm}
      />
      <DeleteGroupModal
        open={deleteGroupTarget !== null}
        target={deleteGroupTarget}
        onClose={handleCloseDeleteGroup}
      />
      <OptionFormModal
        open={optionFormOpen}
        target={optionFormTarget}
        presetGroupId={optionFormPresetGroupId}
        excludedSubjectIds={optionFormExcludedSubjectIds}
        groupContext={optionFormGroupContext}
        onClose={handleCloseOptionForm}
      />
      <DeleteOptionModal
        open={deleteOptionTarget !== null}
        target={deleteOptionTarget}
        onClose={handleCloseDeleteOption}
      />
    </Flex>
  );
}
