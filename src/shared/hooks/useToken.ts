import { theme } from "antd";

/**
 * Reusable hook to access Ant Design theme tokens for consistent spacing, colors, and typography.
 */
export function useToken() {
  const { token } = theme.useToken();
  return {
    ...token,
    colorPrimary: token.colorPrimary,
    colorSuccess: token.colorSuccess,
    colorWarning: token.colorWarning,
    colorError: token.colorError,
    colorInfo: token.colorInfo,
    colorText: token.colorText,
    colorTextSecondary: token.colorTextSecondary,
    colorTextTertiary: token.colorTextTertiary,
    colorBorder: token.colorBorder,
    colorBorderSecondary: token.colorBorderSecondary,
    colorBgContainer: token.colorBgContainer,
    colorBgElevated: token.colorBgElevated,
    colorBgLayout: token.colorBgLayout,
    fontFamily: token.fontFamily,
    fontSize: token.fontSize,
    fontSizeSM: token.fontSizeSM,
    fontSizeHeading2: token.fontSizeHeading2,
    fontWeightStrong: token.fontWeightStrong,
    sizeXXL: token.sizeXXL,
    sizeXL: token.sizeXL,
    sizeLG: token.sizeLG,
    sizeMD: token.sizeMD,
    sizeSM: token.sizeSM,
    sizeXS: token.sizeXS,
    controlHeight: token.controlHeight,
    controlHeightSM: token.controlHeightSM,
    controlHeightLG: token.controlHeightLG,
    borderRadius: token.borderRadius,
    borderRadiusLG: token.borderRadiusLG,
    boxShadow: token.boxShadow,
    boxShadowSecondary: token.boxShadowSecondary,
    marginXL: token.marginXL,
    marginLG: token.marginLG,
    marginMD: token.marginMD,
    marginSM: token.marginSM,
    marginXS: token.marginXS,
    paddingLG: token.paddingLG,
    paddingMD: token.paddingMD,
    paddingSM: token.paddingSM,
    paddingXS: token.paddingXS,
    fontSizeLG: token.fontSizeLG,
    colorTextHeading: token.colorTextHeading,
  };
}

export type UseTokenReturn = ReturnType<typeof useToken>;
