import { useToken } from "@/hooks/useToken";
import type { DepartmentWithPrograms } from "../types";
import { DownOutlined, EditOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Collapse, Typography } from "antd";
import { useState } from "react";
import { AddProgramModal } from "./modals";
import { ProgramsTable } from "./ProgramsTable";
import { useIsMobile } from "@/hooks/useBreakpoint";

export interface DepartmentBlockProps {
  data: DepartmentWithPrograms;
  /** When true, this department panel starts expanded. */
  defaultExpanded?: boolean;
  onAddProgram?: (
    departmentId: number,
    values: {
      name: string;
      degreeTitle: string;
      durationInYears: number;
      utmeMinimumTotalUnit: number;
      deMinimumTotalUnit: number;
    },
  ) => void | Promise<void>;
  onEditDepartment?: (departmentId: number) => void;
  onProgramDetails?: (program: { id: number; name: string; degreeTitle: string; durationInYears: number }) => void;
}

export function DepartmentBlock({
  data,
  defaultExpanded = false,
  onAddProgram,
  onEditDepartment,
  onProgramDetails,
}: DepartmentBlockProps) {
  const token = useToken();
  const isMobile = useIsMobile();
  const [addProgramModalOpen, setAddProgramModalOpen] = useState(false);
  const { department, programs } = data;

  const header = (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        flexWrap: "wrap",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        width: "100%",
        paddingRight: isMobile ? 8 : 16,
        gap: isMobile ? 8 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: isMobile ? 12 : 24,
          minWidth: 0,
        }}
      >
        <div>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: token.colorTextTertiary,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: 2,
            }}
          >
            Department code
          </span>
            <span
              style={{
                fontSize: 10,
                fontWeight: 700,
              color: token.colorTextSecondary,
              background: token.colorBgContainer,
              border: `1px solid ${token.colorBorder}`,
              padding: "2px 6px",
              borderRadius: token.borderRadius,
            }}
          >
            {department.code}
          </span>
        </div>
        <div style={{ minWidth: 0 }}>
          <span
            style={{
              fontSize: 9,
              fontWeight: 700,
              color: token.colorTextTertiary,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              display: "block",
              marginBottom: 2,
            }}
          >
            Department name
          </span>
          <Typography.Text strong style={{ fontSize: token.fontSizeSM }} ellipsis>
            {department.name}
          </Typography.Text>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: token.colorTextSecondary,
            background: token.colorBgContainer,
            padding: "4px 8px",
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorBorder}`,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {programs.length} Program{programs.length !== 1 ? "s" : ""}
        </span>
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ fontSize: 14 }} />}
          style={{ color: token.colorTextTertiary }}
          onClick={(e) => {
            e.stopPropagation();
            onEditDepartment?.(department.id);
          }}
        />
      </div>
    </div>
  );

  return (
    <>
      <Collapse
        defaultActiveKey={defaultExpanded ? ["1"] : []}
        expandIcon={({ isActive }) => (
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: "#fff",
              flexShrink: 0,
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
            }}
          >
            {isActive ? (
              <DownOutlined style={{ fontSize: 14, color: token.colorText }} />
            ) : (
              <RightOutlined style={{ fontSize: 14, color: token.colorText }} />
            )}
          </span>
        )}
        expandIconPosition="start"
        style={{
          marginBottom: isMobile ? 12 : 16,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          overflow: "hidden",
        }}
      >
        <Collapse.Panel header={header} key="1">
          <div style={{ padding: isMobile ? "0 12px 12px" : "0 16px 16px" }}>
            <ProgramsTable
              programs={programs}
              onAddProgram={() => setAddProgramModalOpen(true)}
              onProgramDetails={onProgramDetails}
            />
          </div>
        </Collapse.Panel>
      </Collapse>

      {onAddProgram && (
        <AddProgramModal
          open={addProgramModalOpen}
          onClose={() => setAddProgramModalOpen(false)}
          department={department}
          onSubmit={async (values) => {
            await onAddProgram(department.id, values);
            setAddProgramModalOpen(false);
          }}
        />
      )}
    </>
  );
}
