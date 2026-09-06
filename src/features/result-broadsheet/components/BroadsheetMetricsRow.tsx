import { DashCard } from "@/components/ui-kit";
import { Col, Row } from "antd";
import type { CohortStatistics } from "../types/result-broadsheet";
import { formatPercentage } from "../utils/formatters";

export interface BroadsheetMetricsRowProps {
  statistics?: CohortStatistics;
  isLoading?: boolean;
}

export function BroadsheetMetricsRow({
  statistics,
  isLoading = false,
}: BroadsheetMetricsRowProps) {
  const cardState = isLoading ? "loading" : "default";

  const totalRegistered = statistics?.totalRegistered ?? statistics?.totalStudents ?? 0;
  const totalSat = statistics?.totalSatForExam ?? 0;
  const totalPassed = statistics?.passedCount ?? statistics?.totalPassed ?? 0;
  const probationCount = statistics?.probationCount ?? 0;
  const repeatCount = statistics?.repeatCount ?? 0;
  const withdrawnCount = statistics?.withdrawnCount ?? 0;
  const successRate = statistics?.successRate ?? 0;

  const atRiskTotal = probationCount + repeatCount + withdrawnCount;

  return (
    <Row gutter={[12, 12]}>
      <Col xs={12} sm={12} md={8} lg={8} xl={4.8} style={{ display: "flex" }}>
        <DashCard
          title="Registered"
          value={totalRegistered}
          state={cardState}
          size="md"
          density="comfortable"
          style={{ width: "100%" }}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={8} xl={4.8} style={{ display: "flex" }}>
        <DashCard
          title="Sat for Exam"
          value={totalSat}
          state={cardState}
          size="md"
          density="comfortable"
          style={{ width: "100%" }}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={8} xl={4.8} style={{ display: "flex" }}>
        <DashCard
          title="Passed (Good Standing)"
          value={totalPassed}
          state={cardState}
          size="md"
          density="comfortable"
          style={{ width: "100%" }}
        />
      </Col>
      <Col xs={12} sm={12} md={8} lg={8} xl={4.8} style={{ display: "flex" }}>
        <DashCard
          title="Probation & Interventions"
          value={atRiskTotal}
          meta={`Probation: ${probationCount} · Repeat: ${repeatCount} · Withdrawn: ${withdrawnCount}`}
          state={cardState}
          size="md"
          density="comfortable"
          style={{ width: "100%" }}
        />
      </Col>
      <Col xs={24} sm={12} md={8} lg={8} xl={4.8} style={{ display: "flex" }}>
        <DashCard
          title="Success Rate"
          value={formatPercentage(successRate)}
          state={cardState}
          size="md"
          density="comfortable"
          style={{ width: "100%" }}
        />
      </Col>
    </Row>
  );
}
