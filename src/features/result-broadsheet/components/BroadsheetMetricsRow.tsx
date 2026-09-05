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
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} md={8} lg={4} style={{ flex: 1 }}>
        <DashCard
          title="Registered"
          value={totalRegistered}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} style={{ flex: 1 }}>
        <DashCard
          title="Sat for Exam"
          value={totalSat}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} style={{ flex: 1 }}>
        <DashCard
          title="Passed (Good Standing)"
          value={totalPassed}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} style={{ flex: 1 }}>
        <DashCard
          title="Probation & Interventions"
          value={atRiskTotal}
          meta={`Probation: ${probationCount} · Repeat: ${repeatCount} · Withdrawn: ${withdrawnCount}`}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
      <Col xs={24} sm={12} md={8} lg={4} style={{ flex: 1 }}>
        <DashCard
          title="Success Rate"
          value={formatPercentage(successRate)}
          state={cardState}
          size="md"
          density="comfortable"
        />
      </Col>
    </Row>
  );
}
