import { DashCard, ExplainerCallout, Table } from "@/components/ui-kit";
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { formatCycleOptionLabel } from "@/features/admission-config/tabs/admission-cycle/utils/admissionCycleDisplay";
import {
  getQuotaCategoryLabel,
  getRecommendedDecisionLabel,
  QUOTA_CATEGORY_OPTIONS,
} from "@/shared/constants/admissionRecommendedCandidateOptions";
import { getRecommenderReasonLabel } from "@/shared/constants/admissionRecommenderOptions";
import { useToken } from "@/shared/hooks/useToken";
import {
  ConditionalRenderer,
  centeredBox,
} from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { SkeletonRows } from "@/shared/ui/SkeletonRows";
import { EyeOutlined, GiftOutlined, DownloadOutlined, MoreOutlined } from "@ant-design/icons";
import {
  Alert,
  Button,
  Col,
  Dropdown,
  Flex,
  Row,
  Select,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { SorterResult } from "antd/es/table/interface";
import { useRecommendationTab } from "../hooks/useRecommendationTab";
import type {
  AdmissionRecommendedCandidate,
  QuotaCategory,
} from "../types/admission-recommended-candidate";
import { recommendedDecisionTagColor } from "../utiles/recommendationDisplay";
import { RecommendedCandidateDetailDrawer } from "./RecommendedCandidateDetailDrawer";
import { OfferRecommendedCandidateModal } from "./modals/OfferRecommendedCandidateModal";

const QUOTA_TAG_COLOR: Record<QuotaCategory, string> = {
  MERIT: "blue",
  CATCHMENT: "geekblue",
  ELDS: "purple",
};

export function RecommendationTab() {
  const token = useToken();
  const { state, actions, flags } = useRecommendationTab();
  const {
    rows,
    totalItems,
    isLoading,
    isError,
    skipList,
    cycles,
    programs,
    cycleId,
    programId,
    quotaFilter,
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
    handleSortChange,
    handlePageChange,
    clearAllFilters,
    handleOpenDrawer,
    handleCloseDrawer,
    handleOpenOffer,
    handleCloseOffer,
    handleDownload,
    refetch,
  } = actions;

  const { hasData, isFilterActive, isDownloading } = flags;

  const cardState = isLoading ? "loading" : "default";

  const handleTableChange = (
    _: unknown,
    __: unknown,
    sorter:
      | SorterResult<AdmissionRecommendedCandidate>
      | SorterResult<AdmissionRecommendedCandidate>[],
  ) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    if (!s.columnKey || !s.order) {
      handleSortChange("aggregateScore:desc");
      return;
    }
    handleSortChange(
      `${String(s.columnKey)}:${s.order === "ascend" ? "asc" : "desc"}`,
    );
  };

  const columns: ColumnsType<AdmissionRecommendedCandidate> = [
    {
      title: "JAMB Reg. No.",
      key: "jambRegNo",
      render: (_: unknown, r: AdmissionRecommendedCandidate) => {
        const jambRegNo = r.application?.candidate?.jambRegNo ?? "—";
        return jambRegNo ? (
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
        body="Advisory list of proposed admission outcomes computed from screening scores, program cut-offs, live slot usage, and quota category. Recommendations are snapshot-based and do not reserve seats the offer action re-evaluates and commits the final decision."
        dismissible
        collapsible
      />

      <Flex justify="space-between" gap={20} wrap={true}>
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

          <Flex vertical>
            <Typography.Title level={5}>Program</Typography.Title>
            <Select
              placeholder="All programs"
              style={{ minWidth: 240 }}
              value={programId}
              onChange={handleProgramChange}
              disabled={skipList}
              showSearch
              optionFilterProp="label"
              options={programs.map((p) => ({ value: p.id, label: p.name }))}
              allowClear
              onClear={() => handleProgramChange(undefined)}
            />
          </Flex>

          <Flex vertical>
            <Typography.Title level={5}>Quota</Typography.Title>
            <Select
              placeholder="Any quota"
              style={{ minWidth: 160 }}
              value={quotaFilter}
              onChange={(val) =>
                handleQuotaFilterChange(val as QuotaCategory | undefined)
              }
              disabled={skipList}
              options={QUOTA_CATEGORY_OPTIONS}
              allowClear
            />
          </Flex>
        </Flex>

        <PermissionGuard permission={Permission.AdmissionRecommendedCandidatesList}>
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleDownload}
            loading={isDownloading}
            disabled={skipList || isDownloading}
            style={{ alignSelf: "end" }}
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
              error="Failed to load recommended candidates"
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
