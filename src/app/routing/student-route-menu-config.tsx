import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import {
  DollarOutlined,
  FileOutlined,
  FormOutlined,
  HomeOutlined,
  TrophyOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import { useMemo } from "react";
import { appPaths } from "./app-path";

/** Keep allowedScopes in sync with student-route-privilege-matrix.ts */
export type StudentRouteMenuItem = ItemType & {
  allowedScopes?: StudentPortalScope[];
};

export const studentRoutesMenuList: StudentRouteMenuItem[] = [
  {
    key: appPaths.studentHome,
    icon: <HomeOutlined />,
    label: "Home",
    allowedScopes: [StudentPortalScope.Student, StudentPortalScope.Candidate],
  },
  {
    key: appPaths.StudentInvoices,
    icon: <FileOutlined />,
    label: "Invoices",
    allowedScopes: [StudentPortalScope.Student, StudentPortalScope.Candidate],
  },
  {
    key: appPaths.StudentPayments,
    icon: <DollarOutlined />,
    label: "Payments",
    allowedScopes: [StudentPortalScope.Student, StudentPortalScope.Candidate],
  },
  {
    key: appPaths.courseRegistration,
    icon: <FormOutlined />,
    label: "Course Registration",
    allowedScopes: [StudentPortalScope.Student],
  },
  {
    key: appPaths.StudentResults,
    icon: <TrophyOutlined />,
    label: "Results",
    allowedScopes: [StudentPortalScope.Student],
  },
  {
    key: appPaths.StudentBioData,
    icon: <UserOutlined />,
    label: "Bio Data",
    allowedScopes: [StudentPortalScope.Student, StudentPortalScope.Candidate],
  },
];

/** Strip portal-only fields before passing items to Ant Design Menu. */
export function toAntdMenuItem(item: StudentRouteMenuItem): ItemType {
  const { allowedScopes: _allowedScopes, ...menuItem } = item;
  return menuItem;
}

export function useRestrictedStudentRouteMenuItems(): StudentRouteMenuItem[] {
  const { hasStudentPortalScope } = useAccessControl();
  return useMemo(() => {
    return studentRoutesMenuList.filter((item) => {
      if (!item.allowedScopes || item.allowedScopes.length === 0) {
        return true;
      }
      return hasStudentPortalScope(item.allowedScopes);
    });
  }, [hasStudentPortalScope]);
}

/** @deprecated Use useRestrictedStudentRouteMenuItems */
export function useStudentRouteMenuItems(): ItemType[] {
  return useRestrictedStudentRouteMenuItems().map(toAntdMenuItem);
}
