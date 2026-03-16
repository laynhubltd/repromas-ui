import { useToken } from "@/hooks/useToken";
import { message, Tabs, Typography } from "antd";
import { useMemo, useState } from "react";
import { AdmissionConfigTab } from "./admission-config";
// import { SettingsBanner } from "./components";
import { LevelConfigTab } from "./level-config";
import {
  buildSessionsWithSemesters,
  mockSemesters,
  mockSemesterTypes,
  mockSessions,
} from "./mock-session-config";
import {
  AddSemesterModal,
  AddSessionModal,
  SessionConfigTab,
} from "./session-config";
import type { Level } from "./types";

export default function Settings() {
  const token = useToken();
  const [sessions, setSessions] = useState(mockSessions);
  const [semesters, setSemesters] = useState(mockSemesters);
  const [semesterTypes, setSemesterTypes] = useState(mockSemesterTypes);
  const [addSessionOpen, setAddSessionOpen] = useState(false);
  const [addSessionLoading, setAddSessionLoading] = useState(false);
  const [addSemesterOpen, setAddSemesterOpen] = useState(false);
  const [addSemesterSession, setAddSemesterSession] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [addSemesterLoading, setAddSemesterLoading] = useState(false);
  const [levels, setLevels] = useState<Level[]>([
    { id: 1, name: "100 Level", rankOrder: 100, description: "First year" },
    { id: 2, name: "200 Level", rankOrder: 200, description: "Second year" },
    { id: 3, name: "300 Level", rankOrder: 300, description: "Third year" },
    { id: 4, name: "400 Level", rankOrder: 400, description: "Fourth year" },
    { id: 5, name: "500 Level", rankOrder: 500, description: "Fifth year" },
  ]);

  const sessionsWithSemesters = useMemo(
    () => buildSessionsWithSemesters(sessions, semesters),
    [sessions, semesters],
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
      const nextId =
        sessions.length > 0 ? Math.max(...sessions.map((s) => s.id)) + 1 : 1;
      const newSession = {
        id: nextId,
        name: values.name,
        startDate: values.startDate,
        endDate: values.endDate,
        isCurrent: values.isCurrent,
      };
      setSessions((prev) => {
        const updated = [...prev, newSession];
        if (values.isCurrent) {
          return updated.map((s) => ({
            ...s,
            isCurrent: s.id === nextId,
          }));
        }
        return updated;
      });
      message.success("Session created");
      setAddSessionOpen(false);
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
    status: import("./types").SemesterStatus;
  }) => {
    setAddSemesterLoading(true);
    try {
      const nextId =
        semesters.length > 0 ? Math.max(...semesters.map((s) => s.id)) + 1 : 1;
      setSemesters((prev) => [
        ...prev,
        {
          id: nextId,
          name: values.name,
          status: values.status,
          academicSessionId: values.sessionId,
        },
      ]);
      message.success("Semester created");
      setAddSemesterOpen(false);
      setAddSemesterSession(null);
    } finally {
      setAddSemesterLoading(false);
    }
  };

  const handleEditSemester = () => {
    message.info("Edit semester: wire to API");
  };

  const handleAddSemesterType = async (values: { name: string }) => {
    const nextId =
      semesterTypes.length > 0
        ? Math.max(...semesterTypes.map((t) => t.id)) + 1
        : 1;
    setSemesterTypes((prev) => [...prev, { id: nextId, name: values.name }]);
    message.success("Semester type added");
  };

  const handleEditSemesterType = (item: import("./types").SemesterType) => {
    message.info(`Edit semester type: wire to API (id ${item.id})`);
  };

  const handleDeleteSemesterType = (item: import("./types").SemesterType) => {
    setSemesterTypes((prev) => prev.filter((t) => t.id !== item.id));
    message.success("Semester type removed");
  };

  const handleAddLevel = async (values: {
    name: string;
    rankOrder: number;
    description?: string | null;
  }) => {
    const nextId =
      levels.length > 0 ? Math.max(...levels.map((l) => l.id)) + 1 : 1;
    setLevels((prev) => [
      ...prev,
      {
        id: nextId,
        name: values.name,
        rankOrder: values.rankOrder,
        description: values.description ?? null,
      },
    ]);
    message.success("Level created");
  };

  const handleEditLevel = (item: Level) => {
    message.info(`Edit level: wire to API (id ${item.id})`);
  };

  const handleDeleteLevel = (item: Level) => {
    setLevels((prev) => prev.filter((l) => l.id !== item.id));
    message.success("Level removed");
  };

  const tabItems = [
    {
      key: "session-config",
      label: "Session Config",
      children: (
        <SessionConfigTab
          sessionsWithSemesters={sessionsWithSemesters}
          semesterTypes={semesterTypes}
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
      key: "admission-config",
      label: "Admission Config",
      children: <AdmissionConfigTab />,
    },
    {
      key: "level-config",
      label: "Levels",
      children: (
        <div style={{ padding: 24 }}>
          <LevelConfigTab
            levels={levels}
            onAdd={handleAddLevel}
            onEdit={handleEditLevel}
            onDelete={handleDeleteLevel}
          />
        </div>
      ),
    },
    {
      key: "general",
      label: "General",
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
      {/* <div style={{ marginBottom: token.marginXL }}>
        <SettingsBanner />
      </div> */}
      <div
        style={{
          background: token.colorBgContainer,
          borderRadius: token.borderRadius,
          border: `1px solid ${token.colorBorder}`,
          overflow: "hidden",
        }}
      >
        <Tabs
          defaultActiveKey="session-config"
          items={tabItems}
          size="middle"
          tabBarStyle={{
            marginBottom: 0,
            paddingLeft: 32,
            paddingRight: 32,
            paddingTop: `${token.sizeXS}px`,
            paddingBottom: `${token.sizeXS}px`,
            borderBottom: `1px solid ${token.colorBorderSecondary}`,
            fontSize: 16,
            fontWeight: 500,
          }}
        />
      </div>
    </div>
  );
}
