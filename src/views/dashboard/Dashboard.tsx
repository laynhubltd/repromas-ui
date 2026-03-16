import { Card, Typography } from "antd";

export default function Dashboard() {
  return (
    <div>
      <Typography.Title level={4}>Dashboard</Typography.Title>
      <Card>
        <p>Welcome to Repromas. Use the sidebar to navigate.</p>
      </Card>
    </div>
  );
}
