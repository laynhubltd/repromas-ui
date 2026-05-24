import { FormOutlined, HomeOutlined } from "@ant-design/icons";
import type { ItemType } from "antd/es/menu/interface";
import { appPaths } from "./app-path";

/** Main navigation items for the student portal sidebar. */
export const studentRoutesMenuList: ItemType[] = [
  {
    key: appPaths.studentHome,
    icon: <HomeOutlined />,
    label: "Home",
  },
  {
    key: appPaths.courseRegistration,
    icon: <FormOutlined />,
    label: "Course Registration",
  },
];

export function useStudentRouteMenuItems(): ItemType[] {
  return studentRoutesMenuList;
}
