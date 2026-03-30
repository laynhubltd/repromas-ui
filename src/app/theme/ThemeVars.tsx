import { useEffect } from "react";
import { useAppSelector } from "../hooks";
import { darkenHex, lightenHex } from "./themeConfig";

function ThemeVars() {
  const primaryColor = useAppSelector((state) => state.theme.primaryColor);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--color-primary", primaryColor);
    root.style.setProperty("--color-primary-dark", darkenHex(primaryColor, 0.18));
    root.style.setProperty("--color-primary-darker", darkenHex(primaryColor, 0.32));
    root.style.setProperty("--color-primary-light", lightenHex(primaryColor, 0.28));
    root.style.setProperty("--color-primary-lighter", lightenHex(primaryColor, 0.5));
  }, [primaryColor]);

  return null;
}

export default ThemeVars;
