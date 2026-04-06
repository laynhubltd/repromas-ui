// Feature: faculty-department-management
import { DashCard } from "@/components/ui-kit";
import {
    ApartmentOutlined,
    BarChartOutlined,
    BookOutlined,
    TeamOutlined,
} from "@ant-design/icons";
import { Col, Row } from "antd";
import { useMetricsRow } from "../hooks/useMetricsRow";

/**
 * MetricsRow — renders four DashCard components with faculty/department metrics.
 * No props; self-contained via useMetricsRow().
 */
export function MetricsRow() {
  const { state } = useMetricsRow();
  const { facultyCount, departmentCount, programCount, avgDeptsPerFaculty, isLoading, isError } =
    state;

  const cardState = isLoading ? "loading" : "default";

  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title="Faculties"
          meta="Across all faculties"
          value={isError ? "—" : facultyCount}
          icon={<ApartmentOutlined />}
          variant="default"
          density="comfortable"
          size="md"
          state={cardState}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title="Departments"
          meta="Active academic units"
          value={isError ? "—" : departmentCount}
          icon={<TeamOutlined />}
          variant="filled"
          density="comfortable"
          size="md"
          state={cardState}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title="Programs"
          meta="Total enrolled programs"
          value={isError ? "—" : programCount}
          icon={<BookOutlined />}
          variant="outlined"
          density="comfortable"
          size="md"
          state={cardState}
        />
      </Col>
      <Col xs={24} sm={12} lg={6}>
        <DashCard
          title="Avg Depts / Faculty"
          meta="Structure density"
          value={isError ? "—" : avgDeptsPerFaculty}
          icon={<BarChartOutlined />}
          variant="ghost"
          density="comfortable"
          size="md"
          state={cardState}
        />
      </Col>
    </Row>
  );
}
