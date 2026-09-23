import { Card, Col, Row, Skeleton, Space } from "antd";
import { useEffect, useState } from "react";

export interface PageSkeletonProps {
  delayMs?: number;
}

export function PageSkeleton({ delayMs = 150 }: PageSkeletonProps) {
  const [show, setShow] = useState(delayMs <= 0);

  useEffect(() => {
    if (delayMs <= 0) return;
    const timer = setTimeout(() => {
      setShow(true);
    }, delayMs);
    return () => clearTimeout(timer);
  }, [delayMs]);

  if (!show) {
    return null;
  }

  return (
    <div style={{ padding: "24px", minHeight: "calc(100vh - 120px)" }}>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        {/* Page Header skeleton */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Skeleton.Input active size="large" style={{ width: 240, height: 32 }} />
          <Skeleton.Button active size="default" style={{ width: 120 }} />
        </div>

        {/* 3 Metric cards row */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Skeleton active paragraph={{ rows: 1 }} />
            </Card>
          </Col>
        </Row>

        {/* Main Content / Table skeleton */}
        <Card>
          <Skeleton.Input active size="default" style={{ width: 180, marginBottom: 16 }} />
          <Skeleton active paragraph={{ rows: 8 }} />
        </Card>
      </Space>
    </div>
  );
}
