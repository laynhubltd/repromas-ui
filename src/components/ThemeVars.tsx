import { theme } from "antd";
import { useEffect } from "react";

/**
 * Syncs Ant Design theme tokens to CSS custom properties
 * so global CSS (e.g. focus outline) uses the current primary color.
 */
export function ThemeVars() {
  const { token } = theme.useToken();

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", token.colorPrimary);
  }, [token.colorPrimary]);

  return null;
}
