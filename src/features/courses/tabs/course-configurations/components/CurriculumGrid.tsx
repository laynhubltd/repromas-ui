// Feature: course-management
import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import type { SemesterType } from "@/features/settings/tabs/academic-calendar/types/academic-calendar";
import { useToken } from "@/shared/hooks/useToken";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Tag, Tooltip, Typography } from "antd";
import type { CourseConfiguration, CurriculumGridRow } from "../types/course-configuration";

const COURSE_STATUS_COLOR: Record<string, string> = {
  CORE: "blue",
  ELECTIVE: "green",
  REQUIRED: "orange",
  PREREQUISITE: "purple",
};

type CurriculumGridProps = {
  gridRows: CurriculumGridRow[];
  semesterTypes: SemesterType[];
  onEdit: (config: CourseConfiguration) => void;
  onDelete: (config: CourseConfiguration) => void;
};

export function CurriculumGrid({
  gridRows,
  semesterTypes,
  onEdit,
  onDelete,
}: CurriculumGridProps) {
  const token = useToken();

  const sortedRows = [...gridRows].sort(
    (a, b) => (a.level.rankOrder ?? 0) - (b.level.rankOrder ?? 0),
  );
  const sortedSemesterTypes = [...semesterTypes].sort(
    (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0),
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          tableLayout: "fixed",
        }}
      >
        <thead>
          <tr>
            <th
              style={{
                padding: `${token.paddingSM}px ${token.paddingSM}px`,
                background: token.colorBgContainer,
                border: `1px solid ${token.colorBorderSecondary}`,
                textAlign: "left",
                fontWeight: token.fontWeightStrong,
                width: 140,
                minWidth: 140,
              }}
            >
              Level
            </th>
            {sortedSemesterTypes.map((st) => (
              <th
                key={st.id}
                style={{
                  padding: `${token.paddingSM}px ${token.paddingSM}px`,
                  background: token.colorBgContainer,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  textAlign: "left",
                  fontWeight: token.fontWeightStrong,
                  minWidth: 220,
                }}
              >
                {st.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedRows.map((row) => (
            <tr key={row.level.id}>
              <td
                style={{
                  padding: `${token.paddingSM}px ${token.paddingSM}px`,
                  border: `1px solid ${token.colorBorderSecondary}`,
                  background: token.colorBgLayout,
                  fontWeight: token.fontWeightStrong,
                  verticalAlign: "top",
                }}
              >
                <Typography.Text strong>{row.level.name}</Typography.Text>
              </td>
              {sortedSemesterTypes.map((st) => {
                const cellConfigs = row.cells.get(st.id) ?? [];
                return (
                  <td
                    key={st.id}
                    style={{
                      padding: `${token.sizeSM}px ${token.paddingSM}px`,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      background: token.colorBgContainer,
                      verticalAlign: "top",
                    }}
                  >
                    <Flex vertical gap={8}>
                      {cellConfigs.map((config) => (
                        <div
                          key={config.id}
                          style={{
                            padding: `${token.paddingXXS}px ${token.paddingXS}px`,
                            border: `1px solid ${token.colorBorderSecondary}`,
                            borderRadius: token.borderRadius,
                            background: token.colorBgLayout,
                          }}
                        >
                          <Flex justify="space-between" align="flex-start" gap={4}>
                            <Flex vertical gap={2} style={{ flex: 1, minWidth: 0 }}>
                              <Typography.Text
                                strong
                                style={{ fontSize: token.fontSizeSM }}
                                ellipsis
                              >
                                {config.course?.code ?? `#${config.courseId}`}
                              </Typography.Text>
                              <Typography.Text
                                type="secondary"
                                style={{ fontSize: token.fontSizeSM }}
                                ellipsis
                              >
                                {config.course?.title ?? ""}
                              </Typography.Text>
                              <Flex gap={4} align="center" wrap="wrap">
                                <Tag
                                  color={COURSE_STATUS_COLOR[config.courseStatus] ?? "default"}
                                  style={{ margin: 0, fontSize: token.fontSizeSM - 1 }}
                                >
                                  {config.courseStatus}
                                </Tag>
                                <Typography.Text
                                  type="secondary"
                                  style={{ fontSize: token.fontSizeSM }}
                                >
                                  {config.creditUnit} unit{config.creditUnit !== 1 ? "s" : ""}
                                </Typography.Text>
                              </Flex>
                            </Flex>
                            <Flex gap={2} align="center" style={{ flexShrink: 0 }}>
                              <PermissionGuard permission={Permission.CourseConfigsUpdate}>
                                <Tooltip title="Edit configuration">
                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined style={{ fontSize: 13 }} />}
                                    onClick={() => onEdit(config)}
                                  />
                                </Tooltip>
                              </PermissionGuard>
                              <PermissionGuard permission={Permission.CourseConfigsDelete}>
                                <Tooltip title="Delete configuration">
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined style={{ fontSize: 13 }} />}
                                    onClick={() => onDelete(config)}
                                  />
                                </Tooltip>
                              </PermissionGuard>
                            </Flex>
                          </Flex>
                        </div>
                      ))}
                    </Flex>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
