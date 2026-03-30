import { useToken } from "@/shared/hooks/useToken";
import type {
  Semester,
  SessionWithSemesters,
} from "@/shared/types/settings-types";
import { PlusOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import { SessionCollapse } from "./SessionCollapse";

export interface SessionsAndSemestersProps {
  data: SessionWithSemesters[];
  loading?: boolean;
  onAddSession?: () => void;
  onAddSemester?: (session: { id: number; name: string }) => void;
  onEditSemester?: (semester: Semester) => void;
  onSessionMenu?: (sessionId: number) => import("antd").MenuProps["items"];
}

export function SessionsAndSemesters({
  data,
  loading = false,
  onAddSession,
  onAddSemester,
  onEditSemester,
  onSessionMenu,
}: SessionsAndSemestersProps) {
  const token = useToken();

  return (
    <Space direction="vertical" size={token.sizeLG} style={{ width: "100%" }}>
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: token.sizeMD,
        }}
      >
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            Sessions & Semesters
          </Typography.Title>
          <Typography.Text type="secondary" style={{ fontSize: token.fontSizeSM }}>
            Manage academic cycles and their respective terms
          </Typography.Text>
        </div>
        {onAddSession ? (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={onAddSession}
            loading={loading}
          >
            Add New Session
          </Button>
        ) : null}
      </div>
      <div>
        {data.length === 0 && !loading ? (
          <Typography.Text type="secondary">
            No sessions yet. Add a session to get started.
          </Typography.Text>
        ) : null}
        {data.map((item, index) => (
          <SessionCollapse
            key={item.session.id}
            item={item}
            defaultExpanded={index === 0}
            onAddSemester={onAddSemester}
            onEditSemester={onEditSemester}
            onSessionMenu={onSessionMenu}
          />
        ))}
      </div>
    </Space>
  );
}
