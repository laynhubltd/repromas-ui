import { useMemo } from "react";
import { contactChannels } from "../utils/contact-content";

export function useContactContent() {
  return useMemo(
    () => ({
      title: "Contact",
      channels: [...contactChannels],
    }),
    [],
  );
}
