import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import { useToken } from "@/shared/hooks/useToken";
import { StarOutlined } from "@ant-design/icons";
import { Button, Flex, Typography } from "antd";
import type { AdmissionEditorialModel } from "../utils/buildAdmissionEditorialModel";

type AdmissionsOpenMobileBannerProps = {
  model: AdmissionEditorialModel;
  onApply: () => void;
};

/** Original below-form admission notice and candidate sign-up CTA for mobile (<768px). */
export function AdmissionsOpenMobileBanner({
  model,
  onApply,
}: AdmissionsOpenMobileBannerProps) {
  const t = useToken();

  return (
    <div
      style={{
        paddingTop: t.sizeLG,
        borderTop: `1px solid ${t.colorBorderSecondary}`,
      }}
    >
      <div
        role="note"
        style={{
          background: t.colorFillAlter,
          borderRadius: t.borderRadius,
          padding: `${t.paddingXS}px ${t.paddingSM}px`,
          marginBottom: t.sizeSM,
        }}
      >
        <Flex align="flex-start" gap={t.sizeXS}>
          <StarOutlined
            aria-hidden
            style={{
              color: "#fadb14",
              fontSize: t.fontSizeSM,
              lineHeight: 1.5,
              flexShrink: 0,
              marginTop: 1,
            }}
          />
          <Typography.Text
            style={{
              fontSize: t.fontSizeSM,
              color: t.colorTextSecondary,
              lineHeight: 1.5,
            }}
          >
            {model.body}
          </Typography.Text>
        </Flex>
      </div>
      <Button
        block
        onClick={onApply}
        style={{
          height: t.controlHeightLG,
          fontSize: t.fontSize,
          fontWeight: t.fontWeightStrong,
          background: t.colorBgContainer,
          borderColor: t.colorPrimary,
          color: t.colorPrimary,
        }}
      >
        {CANDIDATE_SIGNUP_UI_COPY.loginMobileCta}
      </Button>
    </div>
  );
}
