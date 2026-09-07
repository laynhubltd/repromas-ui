import { Col, Flex, Row, Typography } from "antd";
import { SetupChecklistCard } from "@/features/tenant-setup";
import { ConditionalRenderer } from "@/shared/ui/ConditionalRenderer";
import { DataLoader } from "@/shared/ui/DataLoader";
import { ErrorAlert } from "@/shared/ui/ErrorAlert";
import { useToken } from "@/shared/hooks/useToken";
import { useDashboard } from "../hooks/useDashboard";
import { DashboardFilterBar } from "./DashboardFilterBar";
import { IntakeAlertBanner } from "./IntakeAlertBanner";
import { OverviewCards } from "./OverviewCards";
import { StudentStandingCard } from "./StudentStandingCard";
import { LevelPyramidCard } from "./LevelPyramidCard";
import { DemographicsCard } from "./DemographicsCard";
import { TerminalStatsCard } from "./TerminalStatsCard";
import { AcademicFootprintCard } from "./AcademicFootprintCard";

export default function Dashboard() {
  const token = useToken();
  const { state, actions, flags } = useDashboard();

  const {
    filterState,
    overview,
    structure,
    lifecycle,
    isLoading,
    isFetching,
    isError,
    errorMessage,
    lastUpdatedText,
  } = state;

  return (
    <Flex vertical gap={20} style={{ width: "100%", paddingBottom: token.paddingLG }}>
      {/* Page Header & Title */}
      <Flex justify="space-between" align="baseline" wrap gap={8}>
        <div>
          <Typography.Title level={4} style={{ margin: 0 }}>
            Institutional Analytics Dashboard
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Operational KPIs, student progression, and academic footprint
          </Typography.Text>
        </div>
      </Flex>

      {/* Filter Bar with Popover & Page-Level Freshness Controls */}
      <DashboardFilterBar
        state={filterState}
        dispatch={actions.dispatch}
        lastUpdatedText={lastUpdatedText}
        onRefresh={actions.handleRefetchAll}
        isFetching={isFetching}
        activeSessionName={overview?.activeSessionName}
        activeSemesterName={overview?.activeSemesterName}
      />

      {/* Section Fetch Error Alert (if query fails) */}
      <ConditionalRenderer when={isError}>
        <ErrorAlert
          variant="section"
          error={errorMessage ?? "Failed to load dashboard metrics. Please retry."}
          onRetry={actions.handleRefetchAll}
        />
      </ConditionalRenderer>

      {/* Intake Data Integrity Alert Banner (Invariant D-1 / Edge Case 2) */}
      <ConditionalRenderer when={flags.hasDataGap}>
        <IntakeAlertBanner
          noTransitionCount={flags.noTransitionCount}
          onNavigateToTransitions={actions.handleNavigateToTransitions}
        />
      </ConditionalRenderer>

      {/* Tenant Setup Checklist Card */}
      <ConditionalRenderer when={flags.showSetupChecklist}>
        <SetupChecklistCard />
      </ConditionalRenderer>

      {/* Main Analytics Content with DataLoader */}
      <DataLoader loading={isLoading} minHeight={400}>
        <Flex vertical gap={20} style={{ width: "100%" }}>
          {/* Row 1: Executive KPI Overview Cards (5-Second Hierarchy) */}
          <OverviewCards
            overview={overview}
            lifecycle={lifecycle}
            structure={structure}
            isLoading={isLoading}
          />

          {/* Row 2: Student Progression Standing & Level Distribution */}
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <StudentStandingCard lifecycle={lifecycle} isLoading={isLoading} />
            </Col>
            <Col xs={24} lg={12}>
              <LevelPyramidCard
                levelDistribution={lifecycle?.levelDistribution}
                enrolledHeadcount={lifecycle?.enrolledHeadcount}
                isLoading={isLoading}
              />
            </Col>
          </Row>

          {/* Row 3: Demographics & Historical Exits */}
          <Row gutter={[20, 20]}>
            <Col xs={24} lg={12}>
              <DemographicsCard lifecycle={lifecycle} isLoading={isLoading} />
            </Col>
            <Col xs={24} lg={12}>
              <TerminalStatsCard lifecycle={lifecycle} isLoading={isLoading} />
            </Col>
          </Row>

          {/* Row 4: Academic Footprint by Faculty / Unit */}
          <Row gutter={[20, 20]}>
            <Col xs={24}>
              <AcademicFootprintCard structure={structure} isLoading={isLoading} />
            </Col>
          </Row>
        </Flex>
      </DataLoader>
    </Flex>
  );
}
