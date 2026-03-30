import { useIsMobile } from "@/hooks/useBreakpoint";
import { useToken } from "@/shared/hooks/useToken";
import { ExpandAltOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { Button, Input, Space, Typography } from "antd";
import { useState } from "react";
import type { FacultyWithChildren } from "../types";
import { FacultyRow } from "./FacultyRow";
import { FacultyRowSkeleton } from "./FacultyRowSkeleton";
import { AddFacultyModal } from "./modals";

export interface HierarchyCardProps {
  data: FacultyWithChildren[];
  loading?: boolean;
  loadingMessage?: string;
  totalFaculties: number;
  totalDepartments: number;
  totalPrograms: number;
  onAddFaculty?: (values: { code: string; name: string }) => void | Promise<void>;
  onAddDepartment?: (facultyId: number, values: { code: string; name: string }) => void | Promise<void>;
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
  onEditFaculty?: (facultyId: number) => void;
  onEditDepartment?: (departmentId: number) => void;
  onProgramDetails?: (program: { id: number; name: string; degreeTitle: string; durationInYears: number }) => void;
}

export function HierarchyCard({
  data,
  loading = false,
  loadingMessage,
  onAddFaculty,
  onAddDepartment,
  onAddProgram,
  onEditFaculty,
  onEditDepartment,
  onProgramDetails,
}: HierarchyCardProps) {
  const token = useToken();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState("");
  const [addFacultyOpen, setAddFacultyOpen] = useState(false);
  const [expandAll, setExpandAll] = useState(false);

  const filteredData = search.trim()
    ? data.filter(
        (f) =>
          f.faculty.name.toLowerCase().includes(search.toLowerCase()) ||
          f.faculty.code.toLowerCase().includes(search.toLowerCase()),
      )
    : data;

  return (
    <>
      <div
        style={{
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          overflow: "hidden",
          background: token.colorBgContainer,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: isMobile ? "column" : "row",
            flexWrap: "wrap",
            alignItems: isMobile ? "stretch" : "center",
            justifyContent: "space-between",
            gap: isMobile ? 12 : 16,
            padding: isMobile ? "16px" : "20px 24px",
            background: token.colorBgLayout,
            borderBottom: `1px solid ${token.colorBorder}`,
          }}
        >
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: isMobile ? 12 : 24,
              order: 1,
            }}
          >
            <Typography.Text
              strong
              style={{
                fontSize: isMobile ? 11 : 12,
                textTransform: "uppercase",
                letterSpacing: "0.15em",
                color: token.colorText,
              }}
            >
              Academic Hierarchy
            </Typography.Text>
            {onAddFaculty && (
              <Button
                type="primary"
                icon={<PlusOutlined />}
                size={isMobile ? "small" : "middle"}
                style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
                onClick={() => setAddFacultyOpen(true)}
              >
                New Faculty
              </Button>
            )}
          </div>
          <Space
            size="middle"
            wrap
            style={{
              width: isMobile ? "100%" : undefined,
              order: 2,
            }}
          >
            <Input
              placeholder="Search hierarchy..."
              prefix={<SearchOutlined style={{ color: token.colorTextTertiary }} />}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              allowClear
              style={{
                width: isMobile ? "100%" : 280,
                minWidth: isMobile ? 0 : 200,
                fontSize: token.fontSizeSM,
              }}
            />
            <Button
              type="default"
              icon={<ExpandAltOutlined />}
              style={{
                fontSize: 10,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
              onClick={() => setExpandAll((e) => !e)}
            >
              {expandAll ? "Collapse" : "Expand"}
            </Button>
          </Space>
        </div>

        <div style={{ padding: isMobile ? 12 : 24 }}>
          {loading ? (
            <FacultyRowSkeleton message={loadingMessage} />
          ) : filteredData.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: 48,
                color: token.colorTextSecondary,
              }}
            >
              <Typography.Text type="secondary">
                {search.trim() ? "No faculties match your search." : "No faculties yet. Add one to get started."}
              </Typography.Text>
            </div>
          ) : (
            filteredData.map((item, index) => (
              <FacultyRow
                key={item.faculty.id}
                data={item}
                expandFirstDepartment={index === 0}
                onAddDepartment={onAddDepartment}
                onEditFaculty={onEditFaculty}
                onAddProgram={onAddProgram}
                onEditDepartment={onEditDepartment}
                onProgramDetails={onProgramDetails}
              />
            ))
          )}
        </div>
      </div>

      {onAddFaculty && (
        <AddFacultyModal
          open={addFacultyOpen}
          onClose={() => setAddFacultyOpen(false)}
          onSubmit={onAddFaculty}
        />
      )}
    </>
  );
}
