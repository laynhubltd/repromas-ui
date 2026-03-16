import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/hooks/useToken";
import { CalendarOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { Tabs } from "antd";
import type { SemesterType, SessionWithSemesters } from "../types";
import { SemesterTypesTab, SessionsAndSemesters } from "./components";

export interface SessionConfigTabProps {
  sessionsWithSemesters: SessionWithSemesters[];
  semesterTypes: SemesterType[];
  sessionsLoading?: boolean;
  semesterTypesLoading?: boolean;
  onAddSession?: () => void;
  onAddSemester?: (session: { id: number; name: string }) => void;
  onEditSemester?: (semester: import("../types").Semester) => void;
  onSessionMenu?: (sessionId: number) => import("antd").MenuProps["items"];
  onAddSemesterType?: (values: { name: string }) => void | Promise<void>;
  onEditSemesterType?: (item: SemesterType) => void;
  onDeleteSemesterType?: (item: SemesterType) => void;
}

const SUB_TAB_SESSIONS = "sessions";
const SUB_TAB_TYPES = "types";

export function SessionConfigTab({
  sessionsWithSemesters,
  semesterTypes,
  sessionsLoading = false,
  semesterTypesLoading = false,
  onAddSession,
  onAddSemester,
  onEditSemester,
  onSessionMenu,
  onAddSemesterType,
  onEditSemesterType,
  onDeleteSemesterType,
}: SessionConfigTabProps) {
  const isMobile = useIsMobile();
  const token = useToken();

  const tabItems = [
    {
      key: SUB_TAB_SESSIONS,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <CalendarOutlined />
          Sessions & Semesters
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <SessionsAndSemesters
            data={sessionsWithSemesters}
            loading={sessionsLoading}
            onAddSession={onAddSession}
            onAddSemester={onAddSemester}
            onEditSemester={onEditSemester}
            onSessionMenu={onSessionMenu}
          />
        </div>
      ),
    },
    {
      key: SUB_TAB_TYPES,
      label: (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
          <UnorderedListOutlined />
          Semester Types
        </span>
      ),
      children: (
        <div style={{ padding: isMobile ? 16 : 32 }}>
          <SemesterTypesTab
            data={semesterTypes}
            loading={semesterTypesLoading}
            onAdd={onAddSemesterType}
            onEdit={onEditSemesterType}
            onDelete={onDeleteSemesterType}
          />
        </div>
      ),
    },
  ];

  return (
    <Tabs
      tabPosition={isMobile ? "top" : "left"}
      items={tabItems}
      tabBarGutter={0}
      style={{ minHeight: 560, paddingTop: `${token.sizeXS}px` }}
    />
  );
}
