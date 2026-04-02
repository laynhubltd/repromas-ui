import { useMemo } from "react";
import { servicesList } from "../utils/services-content";

export function useServicesContent() {
  return useMemo(
    () => ({
      title: "Services",
      items: [...servicesList],
    }),
    [],
  );
}
