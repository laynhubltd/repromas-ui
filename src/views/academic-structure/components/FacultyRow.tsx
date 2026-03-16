import { colors } from "@/config/theme";
import { useToken } from "@/hooks/useToken";
import type { FacultyWithChildren } from "../types";
import { DownOutlined, EditOutlined, MoreOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { Button, Collapse, Typography } from "antd";
import { useState } from "react";
import { DepartmentBlock } from "./DepartmentBlock";
import { EmptyDepartment } from "./EmptyDepartment";
import { AddDepartmentModal } from "./modals";
import { useIsMobile } from "@/hooks/useBreakpoint";

export interface FacultyRowProps {
  data: FacultyWithChildren;
  /** When true, the first department in this faculty starts expanded (e.g. for the first faculty in the list). */
  expandFirstDepartment?: boolean;
  onAddDepartment?: (facultyId: number, values: { code: string; name: string }) => void | Promise<void>;
  onEditFaculty?: (facultyId: number) => void;
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

export function FacultyRow({
  data,
  expandFirstDepartment = false,
  onAddDepartment,
  onEditFaculty,
  onAddProgram,
  onEditDepartment,
  onProgramDetails,
}: FacultyRowProps) {
  const token = useToken();
  const isMobile = useIsMobile();
  const [addDepartmentModalOpen, setAddDepartmentModalOpen] = useState(false);
  const { faculty, departments } = data;
  const hasDepartments = departments.length > 0;

  const openAddDepartmentModal = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    setAddDepartmentModalOpen(true);
  };

  const header = (
    <div
      style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        flexWrap: "wrap",
        alignItems: isMobile ? "flex-start" : "center",
        justifyContent: "space-between",
        width: "100%",
        paddingRight: isMobile ? 8 : 24,
        gap: isMobile ? 10 : 0,
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: isMobile ? 12 : 16,
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
            Faculty code
          </span>
          <span
            style={{
              padding: "2px 8px",
              background: colors.primary,
              color: "#fff",
              fontSize: 9,
              fontWeight: 700,
              borderRadius: token.borderRadius,
            }}
          >
            {faculty.code}
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
            Faculty name
          </span>
          <Typography.Text
            strong
            style={{ fontSize: isMobile ? token.fontSizeSM : token.fontSize }}
            ellipsis
          >
            {faculty.name}
          </Typography.Text>
        </div>
        <span
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: token.colorTextSecondary,
            background: token.colorBgLayout,
            padding: "4px 8px",
            borderRadius: token.borderRadius,
            border: `1px solid ${token.colorBorder}`,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            whiteSpace: "nowrap",
          }}
        >
          {departments.length} Department{departments.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: isMobile ? 4 : 8,
          flexShrink: 0,
        }}
      >
        <Button
          size="small"
          style={{
            fontSize: 10,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderColor: `${colors.primary}33`,
            color: colors.primary,
          }}
          icon={<PlusOutlined />}
          onClick={openAddDepartmentModal}
        >
          {isMobile ? "Add Dept" : "Add Department"}
        </Button>
        <span
          style={{
            width: 1,
            height: 16,
            background: token.colorBorder,
            margin: "0 4px",
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<EditOutlined style={{ fontSize: 14 }} />}
          style={{ color: token.colorTextTertiary }}
          onClick={(e) => {
            e.stopPropagation();
            onEditFaculty?.(faculty.id);
          }}
        />
        <Button
          type="text"
          size="small"
          icon={<MoreOutlined style={{ fontSize: 14 }} />}
          style={{ color: token.colorTextTertiary }}
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </div>
  );

  return (
    <Collapse
      defaultActiveKey={hasDepartments ? ["1"] : []}
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
        <div
          style={{
            borderLeft: isMobile ? "none" : `1px solid ${token.colorBorder}`,
            marginLeft: isMobile ? 0 : 24,
            paddingLeft: isMobile ? 0 : 24,
            paddingTop: isMobile ? 12 : 16,
          }}
        >
          {hasDepartments ? (
            departments.map((d, index) => (
              <DepartmentBlock
                key={d.department.id}
                data={d}
                defaultExpanded={expandFirstDepartment && index === 0}
                onAddProgram={onAddProgram}
                onEditDepartment={onEditDepartment}
                onProgramDetails={onProgramDetails}
              />
            ))
          ) : (
            <EmptyDepartment onAddDepartment={openAddDepartmentModal} />
          )}
        </div>
      </Collapse.Panel>

      {onAddDepartment && (
        <AddDepartmentModal
          open={addDepartmentModalOpen}
          onClose={() => setAddDepartmentModalOpen(false)}
          faculty={faculty}
          onSubmit={async (values) => {
            await onAddDepartment(faculty.id, values);
            setAddDepartmentModalOpen(false);
          }}
        />
      )}
    </Collapse>
  );
}
