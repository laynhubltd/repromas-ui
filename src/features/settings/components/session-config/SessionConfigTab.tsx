import { Tabs } from "@/components/ui-kit";
import { useIsMobile } from "@/hooks/useBreakpoint";
import type { SemesterType, SessionWithSemesters } from "@/shared/types/settings-types";
import { CalendarOutlined, UnorderedListOutlined } from "@ant-design/icons";
import { SemesterTypesTab, SessionsAndSemesters } from "./components";

export interface SessionConfigTabProps {
  sessionsWithSemesters: SessionWithSemesters[];
  semesterTypes: SemesterType[];
  sessionsLoading?: boolean;
  semesterTypesLoading?: boolean;
  onAddSession?: () => void;
  onAddSemester?: (session: { id: number; name: string }) => void;
  onEditSemester?: (semester: import("@/shared/types/settings-types").Semester) => void;
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

  return (
    <Tabs
      tabPosition={isMobile ? "top" : "left"}
      size="sm"
      density="compact"
      variant="default"
      style={{ minHeight: 560 }}
      aria-label="Session configuration sections"
      items={[
        {
          key: SUB_TAB_SESSIONS,
          label: "Sessions & Semesters",
          icon: <CalendarOutlined />,
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
          label: "Semester Types",
          icon: <UnorderedListOutlined />,
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
      ]}
    />
  );
}
