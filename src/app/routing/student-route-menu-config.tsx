import { StudentPortalScope } from "@/features/access-control/student-portal-scopes";
import { useAccessControl } from "@/features/access-control/use-access-control";
import { AppIcon } from "@/shared/ui/AppIcon";
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
    icon: <AppIcon name="home" size="md" />,
    label: "Home",
    allowedScopes: [StudentPortalScope.Student, StudentPortalScope.Candidate],
  },
  {
    key: appPaths.StudentApply,
    icon: <AppIcon name="file-edit" size="md" />,
    label: "Apply",
    allowedScopes: [StudentPortalScope.Candidate],
  },
  {
    key: appPaths.StudentInvoices,
    icon: <AppIcon name="invoice" size="md" />,
    label: "Invoices",
    allowedScopes: [StudentPortalScope.Student, StudentPortalScope.Candidate],
  },
  {
    key: appPaths.StudentPayments,
    icon: <AppIcon name="credit-card" size="md" />,
    label: "Payments",
    allowedScopes: [StudentPortalScope.Student, StudentPortalScope.Candidate],
  },
  {
    key: appPaths.courseRegistration,
    icon: <AppIcon name="book-03" size="md" />,
    label: "Course Registration",
    allowedScopes: [StudentPortalScope.Student],
  },
  {
    key: appPaths.StudentResults,
    icon: <AppIcon name="award" size="md" />,
    label: "Results",
    allowedScopes: [StudentPortalScope.Student],
  },
  {
    key: appPaths.StudentApplication,
    icon: <AppIcon name="checkmark-badge" size="md" />,
    label: "Application",
    allowedScopes: [StudentPortalScope.Candidate],
  },
  {
    key: appPaths.StudentAdmission,
    icon: <AppIcon name="diploma" size="md" />,
    label: "Admission",
    allowedScopes: [StudentPortalScope.Candidate],
  },
  {
    key: appPaths.StudentBioData,
    icon: <AppIcon name="user-circle" size="md" />,
    label: "Bio Data",
    allowedScopes: [StudentPortalScope.Student],
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
