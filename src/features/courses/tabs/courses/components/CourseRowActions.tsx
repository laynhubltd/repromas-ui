import { PermissionGuard } from "@/features/access-control";
import { Permission } from "@/features/access-control/permissions";
import { DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Button, Flex, Tooltip } from "antd";

import type { Course } from "../types/course";
import {
  canDeleteCourse,
  canEditCourse,
  getDeleteRestrictionReason,
  getEditRestrictionReason,
} from "../utils/course-capabilities";

type CourseRowActionsProps = {
  course: Course;
  onEdit: (course: Course) => void;
  onDelete: (course: Course) => void;
};

/**
 * Row action cell for the courses table.
 *
 * Two independent gates compose here:
 *  - static RBAC (PermissionGuard) — hides the action the role never has;
 *  - per-row capability flags (course-capabilities, server-computed) —
 *    disables the action with the reason as a tooltip.
 * The <span> wrapper is required: antd disabled buttons swallow pointer
 * events, so the Tooltip would otherwise never trigger.
 */
export function CourseRowActions({ course, onEdit, onDelete }: CourseRowActionsProps) {
  return (
    <Flex align="center" justify="flex-end" gap={4}>
      <PermissionGuard permission={[Permission.CoursesUpdate, Permission.CoursesManage]}>
        <Tooltip title={getEditRestrictionReason(course)}>
          <span>
            <Button
              type="text"
              size="small"
              disabled={!canEditCourse(course)}
              icon={<EditOutlined style={{ fontSize: 16 }} />}
              onClick={() => onEdit(course)}
              aria-label="Edit course"
            />
          </span>
        </Tooltip>
      </PermissionGuard>
      <PermissionGuard permission={[Permission.CoursesDelete, Permission.CoursesManage]}>
        <Tooltip title={getDeleteRestrictionReason(course)}>
          <span>
            <Button
              type="text"
              size="small"
              danger
              disabled={!canDeleteCourse(course)}
              icon={<DeleteOutlined style={{ fontSize: 16 }} />}
              onClick={() => onDelete(course)}
              aria-label="Delete course"
            />
          </span>
        </Tooltip>
      </PermissionGuard>
    </Flex>
  );
}
