import { Tabs } from "@/components/ui-kit";
import {
  useCreateSemesterMutation,
  useCreateSessionMutation,
  useGetLevelsQuery,
  useGetSemesterTypesQuery,
  useGetSessionsQuery,
} from "@/features/settings/api/settingsApi";
import type { Level, SemesterType } from "@/shared/types/settings-types";
import { BookOutlined, ControlOutlined, PartitionOutlined, SettingOutlined } from "@ant-design/icons";
import { message, Typography } from "antd";
import { useMemo, useState } from "react";
import { CurriculumVersionTab } from "../tabs/curriculum-version";
import { buildSessionsWithSemesters } from "../utils/mock-session-config";
import { LevelConfigTab } from "./level-config";
import {
  AddSemesterModal,
  AddSessionModal,
  SessionConfigTab,
} from "./session-config";

export default function Settings() {
  // Server state — fetched via RTK Query
  const { data: sessions = [], isLoading: sessionsLoading } = useGetSessionsQuery();
  const { data: semesterTypes = [], isLoading: semesterTypesLoading } = useGetSemesterTypesQuery();
  const { data: levels = [] } = useGetLevelsQuery();

  // Mutations
  const [createSession] = useCreateSessionMutation();
  const [createSemester] = useCreateSemesterMutation();

  // UI state — modal open/close
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [addSessionLoading, setAddSessionLoading] = useState(false);
  const [addSemesterOpen, setAddSemesterOpen] = useState(false);
  const [addSemesterSession, setAddSemesterSession] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [addSemesterLoading, setAddSemesterLoading] = useState(false);

  const sessionsWithSemesters = useMemo(
    () => buildSessionsWithSemesters(sessions, []),
    [sessions],
  );

  const handleAddSession = () => {
    setAddSessionOpen(true);
  };

  const handleSubmitSession = async (values: {
    name: string;
    startDate: string;
    endDate: string;
    isCurrent: boolean;
  }) => {
    setAddSessionLoading(true);
    try {
      await createSession(values).unwrap();
      message.success("Session created");
      setAddSessionOpen(false);
    } catch {
      message.error("Failed to create session");
    } finally {
      setAddSessionLoading(false);
    }
  };

  const handleAddSemester = (session: { id: number; name: string }) => {
    setAddSemesterSession(session);
    setAddSemesterOpen(true);
  };

  const handleSubmitSemester = async (values: {
    sessionId: number;
    name: string;
    status: import("@/shared/types/settings-types").SemesterStatus;
  }) => {
    setAddSemesterLoading(true);
    try {
      await createSemester({
        name: values.name,
        academicSessionId: values.sessionId,
      }).unwrap();
      message.success("Semester created");
      setAddSemesterOpen(false);
      setAddSemesterSession(null);
    } catch {
      message.error("Failed to create semester");
    } finally {
      setAddSemesterLoading(false);
    }
  };

  const handleEditSemester = () => {
    message.info("Edit semester: wire to API");
  };

  const handleAddSemesterType = async (_values: { name: string }) => {
    message.info("Add semester type: wire to API");
  };

  const handleEditSemesterType = (item: SemesterType) => {
    message.info(`Edit semester type: wire to API (id ${item.id})`);
  };

  const handleDeleteSemesterType = (item: SemesterType) => {
    message.info(`Delete semester type: wire to API (id ${item.id})`);
  };

  const handleAddLevel = async (_values: {
    name: string;
    rankOrder: number;
    description?: string | null;
  }) => {
    message.info("Add level: wire to API");
  };

  const handleEditLevel = (item: Level) => {
    message.info(`Edit level: wire to API (id ${item.id})`);
  };

  const handleDeleteLevel = (item: Level) => {
    message.info(`Delete level: wire to API (id ${item.id})`);
  };

  const tabItems = [
    {
      key: "curriculum-versions",
      label: <span><BookOutlined /> Versions</span>,
      children: <CurriculumVersionTab />,
    },
    {
      key: "level-config",
      label: <span><PartitionOutlined /> Levels</span>,
      children: <LevelConfigTab
            levels={levels}
            onAdd={handleAddLevel}
            onEdit={handleEditLevel}
            onDelete={handleDeleteLevel}
          />,
    },
    {
      key: "session-config",
      label: <span><ControlOutlined /> Session Config</span>,
      children: (
        <SessionConfigTab
          sessionsWithSemesters={sessionsWithSemesters}
          semesterTypes={semesterTypes}
          sessionsLoading={sessionsLoading}
          semesterTypesLoading={semesterTypesLoading}
          onAddSession={handleAddSession}
          onAddSemester={handleAddSemester}
          onEditSemester={handleEditSemester}
          onAddSemesterType={handleAddSemesterType}
          onEditSemesterType={handleEditSemesterType}
          onDeleteSemesterType={handleDeleteSemesterType}
        />
      ),
    },
    {
      key: "general",
      label: <span><SettingOutlined /> General</span>,
      children: (
        <div style={{ padding: 24 }}>
          <Typography.Text type="secondary">
            General settings placeholder. Configure system-wide options here.
          </Typography.Text>
        </div>
      ),
    },
  ];

  return (
    <div style={{ maxWidth: 1280, margin: "0 auto" }}>
      <AddSessionModal
        open={addSessionOpen}
        onClose={() => setAddSessionOpen(false)}
        onSubmit={handleSubmitSession}
        loading={addSessionLoading}
      />
      <AddSemesterModal
        open={addSemesterOpen}
        onClose={() => {
          setAddSemesterOpen(false);
          setAddSemesterSession(null);
        }}
        sessionId={addSemesterSession?.id ?? null}
        sessionName={addSemesterSession?.name ?? ""}
        onSubmit={handleSubmitSemester}
        loading={addSemesterLoading}
      />
      <Tabs
        items={tabItems}
        defaultActiveKey="curriculum-versions"
        size="md"
        density="spacious"
        variant="default"
        aria-label="Settings navigation"
      />
    </div>
  );
}
