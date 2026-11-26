import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import {
  getCandidateEntryModeLabel,
  isRealJambRegNo,
} from "@/shared/constants/admissionCandidateOptions";
import {
  getQuotaCategoryLabel,
  getRecommendedDecisionLabel,
  QUOTA_CATEGORY_OPTIONS,
} from "@/shared/constants/admissionRecommendedCandidateOptions";
import { getRecommenderReasonLabel } from "@/shared/constants/admissionRecommenderOptions";
import { useToken } from "@/shared/hooks/useToken";
import type { CandidateEntryMode } from "@/shared/types/admission-lane";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { formatCycleOptionLabel } from "@/shared/utils/format/admissionCycleDisplay";
import {
  DownloadOutlined,
  EyeOutlined,
  FilterOutlined,
  GiftOutlined,
  MoreOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Col,
  Dropdown,
  Flex,
  Form,
  Popover,
  Row,
  Select,
  Space,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useState } from "react";
import { useRecommendationTab } from "../hooks/useRecommendationTab";
import type {
  AdmissionRecommendedCandidate,
  QuotaCategory,
} from "../types/admission-recommended-candidate";
import { recommendedDecisionTagColor } from "../utiles/recommendationDisplay";
import { OfferRecommendedCandidateModal } from "./modals/OfferRecommendedCandidateModal";
import { RecommendedCandidateDetailDrawer } from "./RecommendedCandidateDetailDrawer";

const QUOTA_TAG_COLOR: Record<QuotaCategory, string> = {
  MERIT: "blue",
  CATCHMENT: "geekblue",
  ELDS: "purple",
};

export function RecommendationTab() {
  const token = useToken();
  const [filterOpen, setFilterOpen] = useState(false);
  const { state, actions, flags } = useRecommendationTab();
  const {
    rows,
    totalItems,
    isLoading,
    isError,
    sectionError,
    skipList,
    cycles,
    programs,
    entryModeOptions,
    cycleId,
    programId,
    quotaFilter,
    entryModeFilter,
    page,
    itemsPerPage,
    offerTarget,
    offerModalOpen,
    drawerTarget,
    drawerOpen,
  } = state;

  const {
    handleCycleChange,
    handleProgramChange,
    handleQuotaFilterChange,
    handleEntryModeFilterChange,
    handlePageChange,
    handleTableChange,
    clearAllFilters,
    handleOpenDrawer,
    handleCloseDrawer,
    handleOpenOffer,
    handleCloseOffer,
    handleDownload,
    refetch,
  } = actions;

  const { hasData, isFilterActive, activeFilterCount, isDownloading } = flags;

  const cardState = isLoading ? "loading" : "default";

  const filterPopoverContent = (
    <Flex vertical gap={16} style={{ width: 280 }}>
      <Form layout="vertical" size="middle">
        <Form.Item label="Program" style={{ marginBottom: 12 }}>
          <Select
            placeholder="All programs"
            style={{ width: "100%" }}
            value={programId}
            onChange={handleProgramChange}
            showSearch
            optionFilterProp="label"
            options={programs.map((p) => ({ value: p.id, label: p.name }))}
            allowClear
            onClear={() => handleProgramChange(undefined)}
          />
        </Form.Item>
        <Form.Item label="Quota" style={{ marginBottom: 12 }}>
          <Select
            placeholder="Any quota"
            style={{ width: "100%" }}
            value={quotaFilter}
            onChange={(val) =>
              handleQuotaFilterChange(val as QuotaCategory | undefined)
            }
            options={QUOTA_CATEGORY_OPTIONS}
            allowClear
          />
        </Form.Item>
        <Form.Item label="Entry Mode" style={{ marginBottom: 0 }}>
          <Select
            placeholder="Any entry mode"
            style={{ width: "100%" }}
            value={entryModeFilter}
            onChange={(val) =>
              handleEntryModeFilterChange(val as CandidateEntryMode | undefined)
            }
            options={entryModeOptions}
            allowClear
          />
        </Form.Item>
      </Form>
      <ConditionalRenderer when={activeFilterCount > 0}>
        <Button
          type="link"
          size="small"
          onClick={() => {
            clearAllFilters();
            setFilterOpen(false);
          }}
          style={{ padding: 0 }}
        >
          Clear all filters
        </Button>
      </ConditionalRenderer>
    </Flex>
  );

  const columns: ColumnsType<AdmissionRecommendedCandidate> = [
    {
      title: "JAMB Reg. No.",
      key: "jambRegNo",
      render: (_: unknown, r: AdmissionRecommendedCandidate) => {
        const jambRegNo = r.application?.candidate?.jambRegNo;
        return isRealJambRegNo(jambRegNo) ? (
          <Typography.Text copyable>{jambRegNo}</Typography.Text>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        );
      },
    },
    {
      title: "Candidate",
      key: "name",
      fixed: "left",
      render: (_: unknown, r: AdmissionRecommendedCandidate) => (
        <Typography.Text strong>
          {r.firstName} {r.lastName}
        </Typography.Text>
      ),
    },
    {
      title: "Entry Mode",
      dataIndex: "entryMode",
      key: "entryMode",
      render: (v: string) => (
        <Tag color="blue">{getCandidateEntryModeLabel(v)}</Tag>
      ),
    },
    {
      title: "Aggregate",
      dataIndex: "aggregateScore",
      key: "aggregateScore",
      sorter: true,
      sortDirections: ["ascend", "descend"],
      defaultSortOrder: "descend",
      render: (v: string) => <Typography.Text>{v}</Typography.Text>,
    },
    {
      title: "Quota",
      dataIndex: "quotaCategory",
      key: "quotaCategory",
      render: (v: QuotaCategory) => (
        <Tag color={QUOTA_TAG_COLOR[v]}>{getQuotaCategoryLabel(v)}</Tag>
      ),
    },
    {
      title: "Recommendation",
      key: "recommendedDecision",
      render: (_: unknown, r: AdmissionRecommendedCandidate) => (
        <Tag color={recommendedDecisionTagColor(r.recommendedDecision)}>
          {getRecommendedDecisionLabel(r.recommendedDecision)}
        </Tag>
      ),
    },
    {
      title: "Applied Program",
      key: "appliedProgram",
      render: (_: unknown, r: AdmissionRecommendedCandidate) =>
        r.appliedProgram?.name ?? (
          <Typography.Text type="secondary">
            #{r.appliedProgramId}
          </Typography.Text>
        ),
    },
    {
      title: "Proposed Program",
      key: "recommendedOfferedProgram",
      render: (_: unknown, r: AdmissionRecommendedCandidate) =>
        r.recommendedDecision === "OFFER_CHANGE_OF_COURSE" ? (
          <Typography.Text>
            {r.recommendedOfferedProgram?.name ??
              `#${r.recommendedOfferedProgramId}`}
          </Typography.Text>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: "Reason",
      key: "reasonCode",
      render: (_: unknown, r: AdmissionRecommendedCandidate) => (
        <Typography.Text>{getRecommenderReasonLabel(r.reasonCode)}</Typography.Text>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      align: "right",
      width: 60,
      fixed: "right",
      render: (_: unknown, record: AdmissionRecommendedCandidate) => {
        const menuItems = [
          {
            key: "view",
            label: (
              <PermissionGuard
                permission={Permission.AdmissionRecommendedCandidatesList}
              >
                <span>View Details</span>
              </PermissionGuard>
            ),
            icon: <EyeOutlined />,
            onClick: () => handleOpenDrawer(record),
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
            disabled: record.recommendedDecision === "REJECTED",
            onClick: () => handleOpenOffer(record),
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
        title="Recommended Candidates"
        body="Advisory list of proposed admission outcomes computed from screening scores, program cut-offs, live slot usage, and quota category. Recommendations are snapshot-based and do not reserve seats — the offer action re-evaluates and commits the final decision."
        dismissible
        collapsible
      />

      <Flex justify="space-between" align="flex-end" gap={16} wrap="wrap">
        <Flex gap={12} align="flex-end" wrap="wrap">
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

        <PermissionGuard permission={Permission.AdmissionRecommendedCandidatesList}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={isDownloading}
            disabled={skipList || isDownloading}
          >
            Download
          </Button>
        </PermissionGuard>
      </Flex>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <DashCard
            title="Total Recommendations"
            value={skipList ? "—" : totalItems}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
        <Col xs={24} sm={12}>
          <DashCard
            title="On This Page"
            value={skipList ? "—" : rows.length}
            state={cardState}
            size="md"
            density="comfortable"
          />
        </Col>
      </Row>

      <ConditionalRenderer when={skipList}>
        <Alert
          type="info"
          showIcon
          message="Select an admission cycle to load recommendations."
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
              error={sectionError ?? "Failed to load recommended candidates"}
              onRetry={refetch}
            />
          </ConditionalRenderer>

          <ConditionalRenderer
            when={!isError && !hasData && !isFilterActive}
            wrapper={centeredBox({
              border: `1px dashed ${token.colorBorder}`,
              borderRadius: token.borderRadius,
              background: token.colorBgContainer,
            })}
          >
            <Typography.Text type="secondary">
              No pending candidates to recommend for this cycle yet.
            </Typography.Text>
          </ConditionalRenderer>

          <ConditionalRenderer
            when={!isError && !hasData && isFilterActive}
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
              No recommendations match your filters.
            </Typography.Text>
            <Button type="link" onClick={clearAllFilters}>
              Clear filters
            </Button>
          </ConditionalRenderer>

          <ConditionalRenderer when={!isError && hasData}>
            <Table<AdmissionRecommendedCandidate>
              rowKey="candidateId"
              dataSource={rows}
              columns={columns}
              size="md"
              density="comfortable"
              scroll={{ x: true }}
              onChange={handleTableChange}
              pagination={{
                current: page,
                pageSize: itemsPerPage,
                total: totalItems,
                showSizeChanger: false,
                onChange: handlePageChange,
              }}
            />
          </ConditionalRenderer>
        </DataLoader>
      </ConditionalRenderer>

      <OfferRecommendedCandidateModal
        open={offerModalOpen && offerTarget != null}
        target={offerTarget}
        onClose={handleCloseOffer}
      />
      <RecommendedCandidateDetailDrawer
        open={drawerOpen}
        target={drawerTarget}
        onClose={handleCloseDrawer}
        onOffer={(t) => {
          handleCloseDrawer();
          handleOpenOffer(t);
        }}
      />
    </Flex>
  );
}
