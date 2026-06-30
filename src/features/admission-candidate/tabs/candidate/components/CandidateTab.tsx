import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { formatCycleOptionLabel } from "@/features/admission-config/tabs/admission-cycle/utils/admissionCycleDisplay";
import { useGetStatesQuery } from "@/features/admission-config/tabs/geography-rule/api/statesApi";
import {
  CANDIDATE_ENTRY_MODE_OPTIONS,
  CANDIDATE_GENDER_OPTIONS,
  FINAL_DECISION_TAG_COLORS,
  getApplicationStatusLabel,
  getCandidateGenderLabel,
  getFinalDecisionLabel,
} from "@/shared/constants/admissionCandidateOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import {
  CloudUploadOutlined,
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  GiftOutlined,
  MoreOutlined,
  PlusOutlined,
  UploadOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Col,
  Dropdown,
  Flex,
  Form,
  Input,
  Popover,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useState } from "react";
import { useAdmissionCandidateTab } from "../hooks/useAdmissionCandidateTab";
import type {
  AdmissionCandidate,
  CandidateGender,
} from "../types/admission-candidate";
import { resolveRelatedName } from "../utils/resolveRelatedLabel";
import { AdmissionCandidateDetailDrawer } from "./AdmissionCandidateDetailDrawer";
import { AdmissionCandidateBulkUploadModal } from "./modals/AdmissionCandidateBulkUploadModal";
import { AdmissionCandidateBulkUploadResultModal } from "./modals/AdmissionCandidateBulkUploadResultModal";
import { AdmissionCandidateFormModal } from "./modals/AdmissionCandidateFormModal";
import { MatriculateAdmissionCandidateModal } from "./modals/MatriculateAdmissionCandidateModal";
import { OfferAdmissionCandidateModal } from "./modals/OfferAdmissionCandidateModal";

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function CandidateTab() {
  const token = useToken();
  const { state, actions, flags, bulkUpload } = useAdmissionCandidateTab();
  const {
    candidates,
    totalItems,
    isLoading,
    isError,
    skipList,
    cycles,
    selectedCycle,
    cycleId,
    firstNameSearch,
    lastNameSearch,
    jambRegSearch,
    genderFilter,
    stateFilter,
    entryModeFilter,
    page,
    itemsPerPage,
    formModalOpen,
    drawerCandidateId,
    bulkUploadModalOpen,
    offerTarget,
    matriculateTarget,
    offerModalOpen,
    matriculateModalOpen,
    canIngest,
  } = state;

  const {
    handleCycleChange,
    handleFirstNameSearchChange,
    handleLastNameSearchChange,
    handleJambRegSearchChange,
    handleGenderFilterChange,
    handleStateFilterChange,
    handleEntryModeFilterChange,
    handleSortChange,
    handlePageChange,
    handleOpenCreate,
    handleCloseForm,
    handleCandidateCreated,
    handleOpenDrawer,
    handleCloseDrawer,
    handleOpenBulkUpload,
    handleCloseBulkUploadModal,
    handleOpenOffer,
    handleCloseOffer,
    handleOpenMatriculate,
    handleCloseMatriculate,
    clearAllFilters,
    refetch,
  } = actions;

  const {
    hasData,
    isSearchActive,
    isFilterActive,
    canOfferCandidate,
    canMatriculateCandidate,
  } = flags;

  const {
    state: bulkState,
    actions: bulkActions,
    flags: bulkFlags,
  } = bulkUpload;

  const [filterOpen, setFilterOpen] = useState(false);

  const { data: statesData } = useGetStatesQuery({ itemsPerPage: 200 });
  const states = statesData?.member ?? [];

  const uploadMenuItems = [
    {
      key: "download-template",
      label: "Download CAPS Template",
      icon: <DownloadOutlined />,
      onClick: bulkActions.handleDownloadTemplate,
      disabled: cycleId === undefined,
    },
    {
      key: "upload-bulk",
      label: "Upload Filled Template",
      icon: <UploadOutlined />,
      onClick: handleOpenBulkUpload,
      disabled: cycleId === undefined,
    },
  ];

  const activeFilterCount = [genderFilter, stateFilter, entryModeFilter].filter(
    (v) => v !== undefined,
  ).length;

  const isAnyFilterActive = isSearchActive || isFilterActive;
  const cardState = isLoading ? "loading" : "default";

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Gender" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any gender"
            allowClear
            value={genderFilter}
            onChange={(val) =>
              handleGenderFilterChange(val as CandidateGender | undefined)
            }
            style={{ width: "100%" }}
            options={CANDIDATE_GENDER_OPTIONS}
          />
        </Form.Item>
        <Form.Item label="State" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any state"
            allowClear
            showSearch
            optionFilterProp="label"
            value={stateFilter}
            onChange={(val) =>
              handleStateFilterChange(val as number | undefined)
            }
            style={{ width: "100%" }}
            options={states.map((s) => ({ value: s.id, label: s.name }))}
          />
        </Form.Item>
        <Form.Item label="Entry Mode" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any entry mode"
            allowClear
            value={entryModeFilter}
            onChange={(val) => handleEntryModeFilterChange(val)}
            style={{ width: "100%" }}
            options={CANDIDATE_ENTRY_MODE_OPTIONS}
          />
        </Form.Item>
      </Form>
      {activeFilterCount > 0 && (
        <Button
          type="link"
          size="small"
          onClick={clearAllFilters}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      )}
    </Flex>
  );

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter:
      | SorterResult<AdmissionCandidate>
      | SorterResult<AdmissionCandidate>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("createdAt:desc");
      return;
    }
    handleSortChange(
      `${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`,
    );
  };

  const columns: ColumnsType<AdmissionCandidate> = [
    {
      title: "JAMB Reg. No.",
      dataIndex: "jambRegNo",
      key: "jambRegNo",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      fixed: "left",
      render: (v: string) => <Typography.Text copyable>{v}</Typography.Text>,
    },
    {
      title: "Name",
      key: "name",
      render: (_: unknown, r: AdmissionCandidate) => (
        <Typography.Text strong>
          {r.firstName} {r.lastName}
        </Typography.Text>
      ),
    },
    {
      title: "State",
      key: "state",
      render: (_: unknown, r: AdmissionCandidate) =>
        resolveRelatedName(r.state, r.stateId),
    },
    {
      title: "Gender",
      dataIndex: "gender",
      key: "gender",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (v: string | null) => getCandidateGenderLabel(v),
    },
    {
      title: "App Status",
      key: "applicationStatus",
      render: (_: unknown, r: AdmissionCandidate) =>
        r.application?.applicationStatus ? (
          getApplicationStatusLabel(r.application.applicationStatus)
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Final Decision",
      key: "finalDecision",
      render: (_: unknown, r: AdmissionCandidate) => {
        const decision = r.application?.finalDecision;
        if (!decision) {
          return <Typography.Text type="secondary">—</Typography.Text>;
        }
        return (
          <Tag color={FINAL_DECISION_TAG_COLORS[decision]}>
            {getFinalDecisionLabel(decision)}
          </Tag>
        );
      },
    },
    {
      title: "Aggregate",
      key: "aggregateScore",
      render: (_: unknown, r: AdmissionCandidate) =>
        r.screening?.aggregateScore ?? (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Created",
      dataIndex: "createdAt",
      key: "createdAt",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      render: (v: string) => formatDate(v),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 60,
      fixed: "right",
      render: (_: unknown, record: AdmissionCandidate) => {
        const menuItems = [
          {
            key: "view",
            label: "View details",
            icon: <EyeOutlined />,
            onClick: () => handleOpenDrawer(record.id),
          },
          {
            key: "offer",
            label: (
              <PermissionGuard
                permission={Permission.AdmissionCandidatesManage}
              >
                <span>Offer admission</span>
              </PermissionGuard>
            ),
            icon: <GiftOutlined />,
            disabled: !canOfferCandidate(record),
            onClick: () => handleOpenOffer(record.id),
          },
          {
            key: "matriculate",
            label: (
              <PermissionGuard
                permission={Permission.AdmissionCandidatesManage}
              >
                <span>Matriculate</span>
              </PermissionGuard>
            ),
            icon: <UserAddOutlined />,
            disabled: !canMatriculateCandidate(record),
            onClick: () => handleOpenMatriculate(record.id),
          },
        ];

        return (
          <Dropdown
            menu={{ items: menuItems }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <Button
              type="text"
              size="small"
              icon={<MoreOutlined style={{ fontSize: 16 }} />}
              style={{ color: token.colorTextTertiary }}
            />
          </Dropdown>
        );
      },
    },
  ];

  return (
    <Flex
      vertical
      gap={24}
      style={{ width: "100%", maxWidth: 1280, margin: "0 auto" }}
    >
      <ExplainerCallout
        intent="info"
        title="Admission Candidates"
        body="Import and manage JAMB CAPS candidates for an admission cycle. Use bulk upload for CAPS spreadsheets or create a single candidate when needed. Offer and matriculate from the row menu or detail drawer."
        dismissible
        collapsible
      />

      <Flex gap={12} align="center" wrap="wrap">
        <Flex vertical>
          <Typography.Title level={5}>Admission cycle</Typography.Title>
          <Select
            placeholder="Select admission cycle"
            style={{ minWidth: 280 }}
            value={cycleId}
            onChange={handleCycleChange}
            options={cycles.map((c) => ({
              value: c.id,
              label: formatCycleOptionLabel(c),
            }))}
            allowClear
            onClear={() => handleCycleChange(undefined)}
          />
        </Flex>
        <ConditionalRenderer when={selectedCycle !== undefined && !canIngest}>
          <Alert
            type="warning"
            showIcon
            message="Ingestion locked — cycle is past Application Open. View and process existing candidates only."
            style={{ flex: 1 }}
          />
        </ConditionalRenderer>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Candidates"
            value={skipList ? "—" : totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="On This Page"
            value={skipList ? "—" : candidates.length}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <Flex gap={12} align="center" justify="space-between" wrap="wrap">
        <Flex gap={12} align="center" wrap="wrap" flex={1}>
          <Input
            placeholder="Search first name…"
            value={firstNameSearch}
            onChange={(e) => handleFirstNameSearchChange(e.target.value)}
            allowClear
            disabled={skipList}
            style={{ maxWidth: 180 }}
          />
          <Input
            placeholder="Search last name…"
            value={lastNameSearch}
            onChange={(e) => handleLastNameSearchChange(e.target.value)}
            allowClear
            disabled={skipList}
            style={{ maxWidth: 180 }}
          />
          <Input
            placeholder="Exact JAMB reg. no…"
            value={jambRegSearch}
            onChange={(e) => handleJambRegSearchChange(e.target.value)}
            allowClear
            disabled={skipList}
            style={{ maxWidth: 200 }}
          />
          <Popover
            content={filterPopoverContent}
            title={
              <Space>
                <FilterOutlined />
                <span>Filters</span>
              </Space>
            }
            trigger="click"
            open={filterOpen}
            onOpenChange={setFilterOpen}
            placement="bottomLeft"
            arrow={false}
          >
            <Badge count={activeFilterCount} size="small">
              <Button
                icon={<FilterOutlined />}
                type={activeFilterCount > 0 ? "primary" : "default"}
                disabled={skipList}
              >
                Filters
              </Button>
            </Badge>
          </Popover>
        </Flex>
        <PermissionGuard
          permission={[
            Permission.AdmissionCandidatesCreate,
            Permission.AdmissionCandidatesManage,
          ]}
        >
          <Dropdown menu={{ items: uploadMenuItems }} trigger={["click"]}>
            <Button icon={<CloudUploadOutlined />} disabled={skipList}>
              Bulk Upload
            </Button>
          </Dropdown>
        </PermissionGuard>
        <PermissionGuard permission={Permission.AdmissionCandidatesCreate}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleOpenCreate}
            disabled={skipList || !canIngest}
            style={{ fontWeight: 600 }}
          >
            Create Candidate
          </Button>
        </PermissionGuard>
      </Flex>

      <ConditionalRenderer when={skipList}>
        <Alert
          type="info"
          showIcon
          message="Select an admission cycle to load candidates."
        />
      </ConditionalRenderer>

      <ConditionalRenderer when={!skipList}>
        <DataLoader
          loading={isLoading}
          loader={<SkeletonRows count={5} variant="card" />}
        >
          <ConditionalRenderer when={isError}>
            <ErrorAlert
              variant="section"
              error="Failed to load admission candidates"
              onRetry={refetch}
            />
          </ConditionalRenderer>

          <ConditionalRenderer
            when={!isError && !hasData && !isAnyFilterActive}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 16 }}
            >
              No candidates for this cycle yet. Download the CAPS template and
              bulk upload, or create a single candidate.
            </Typography.Text>
            <PermissionGuard permission={Permission.AdmissionCandidatesCreate}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={handleOpenCreate}
                disabled={!canIngest}
              >
                Create Candidate
              </Button>
            </PermissionGuard>
          </ConditionalRenderer>

          <ConditionalRenderer
            when={!isError && !hasData && isAnyFilterActive}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text
              type="secondary"
              style={{ display: "block", marginBottom: 8 }}
            >
              No candidates match your search or filters.
            </Typography.Text>
            <Button
              type="link"
              onClick={() => {
                handleFirstNameSearchChange("");
                handleLastNameSearchChange("");
                handleJambRegSearchChange("");
                clearAllFilters();
              }}
            >
              Clear filters
            </Button>
          </ConditionalRenderer>

          <ConditionalRenderer when={!isError && hasData}>
            <Table<AdmissionCandidate>
              rowKey="id"
              dataSource={candidates}
              columns={columns}
              size="md"
              density="comfortable"
              scroll={{ x: true }}
              onChange={handleTableChange}
              pagination={{
                current: page,
                pageSize: itemsPerPage,
                total: totalItems,
                showSizeChanger: true,
                onChange: handlePageChange,
                onShowSizeChange: handlePageChange,
              }}
            />
          </ConditionalRenderer>
        </DataLoader>
      </ConditionalRenderer>

      <AdmissionCandidateFormModal
        open={formModalOpen}
        defaultCycleId={cycleId}
        canIngest={canIngest}
        onClose={handleCloseForm}
        onCreated={handleCandidateCreated}
      />
      <AdmissionCandidateDetailDrawer
        candidateId={drawerCandidateId}
        open={drawerCandidateId !== null}
        onClose={handleCloseDrawer}
        onOffer={(c) => {
          handleCloseDrawer();
          handleOpenOffer(c.id);
        }}
        onMatriculate={(c) => {
          handleCloseDrawer();
          handleOpenMatriculate(c.id);
        }}
        canOffer={canOfferCandidate}
        canMatriculate={canMatriculateCandidate}
      />
      <AdmissionCandidateBulkUploadModal
        open={bulkUploadModalOpen}
        onClose={handleCloseBulkUploadModal}
        selectedFile={bulkState.selectedFile}
        isUploading={bulkState.isUploading}
        hasFile={bulkFlags.hasFile}
        canUpload={bulkFlags.canUpload}
        cycleSelected={cycleId !== undefined}
        onFileChange={bulkActions.handleFileChange}
        onUpload={bulkActions.handleUpload}
        onDownloadTemplate={bulkActions.handleDownloadTemplate}
      />
      <AdmissionCandidateBulkUploadResultModal
        open={bulkState.summaryModalOpen}
        onClose={bulkActions.handleCloseSummary}
        summary={bulkState.summary}
        summaryState={bulkFlags.summaryState}
        onDownloadReport={bulkActions.handleDownloadErrorReport}
      />
      <OfferAdmissionCandidateModal
        open={offerModalOpen}
        candidate={offerTarget}
        onClose={handleCloseOffer}
      />
      <MatriculateAdmissionCandidateModal
        open={matriculateModalOpen}
        candidate={matriculateTarget}
        onClose={handleCloseMatriculate}
      />
    </Flex>
  );
}
