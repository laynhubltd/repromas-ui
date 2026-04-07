import { useGetStaffQuery } from "../api/staffApi";
import type { Staff } from "../types/staff";

/**
 * Manages data fetching for the Staff side drawer.
 * Fetches with include=department,profile only when the drawer is open and a staffId is set.
 */
export function useStaffDrawer(staffId: number | null, open: boolean) {
  const skip = !open || staffId === null;

  const { data: staff, isLoading, isError, refetch } = useGetStaffQuery(
    { id: staffId as number, include: "department,profile,roles" },
    { skip }
  );

  return {
    state: { staff: staff ?? null as Staff | null, isLoading, isError },
    actions: { refetch },
  };
}
