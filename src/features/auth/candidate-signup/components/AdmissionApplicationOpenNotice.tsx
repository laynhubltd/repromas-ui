import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import { useToken } from "@/shared/hooks/useToken";
import { StarOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";

type AdmissionApplicationOpenNoticeProps = {
  cycleName?: string;
};

function buildNoticeBody(cycleName: string | undefined): string {
  const name =
    cycleName?.trim() || CANDIDATE_SIGNUP_UI_COPY.admissionOpenNoticeFallbackCycle;
  return `${name} ${CANDIDATE_SIGNUP_UI_COPY.admissionOpenNoticeSuffix}`;
}

export function AdmissionApplicationOpenNotice({
  cycleName,
}: AdmissionApplicationOpenNoticeProps) {
  const t = useToken();

  return (
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
          {buildNoticeBody(cycleName)}
        </Typography.Text>
      </Flex>
    </div>
  );
}
