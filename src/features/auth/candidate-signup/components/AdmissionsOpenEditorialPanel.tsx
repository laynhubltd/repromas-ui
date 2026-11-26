import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ArrowRightOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { Flex, Typography } from "antd";
import { Link } from "react-router-dom";
import type { AdmissionEditorialModel } from "../utils/buildAdmissionEditorialModel";

const { Title, Paragraph } = Typography;

type AdmissionsOpenEditorialPanelProps = {
  model: AdmissionEditorialModel;
  onCtaRef: (node: HTMLAnchorElement | null) => void;
  onCtaClick: () => void;
  onOpenGuide: () => void;
};

/** Bottom-anchored editorial announcement for the auth brand panel. */
export function AdmissionsOpenEditorialPanel({
  model,
  onCtaRef,
  onCtaClick,
  onOpenGuide,
}: AdmissionsOpenEditorialPanelProps) {
  const t = useToken();

  return (
    <section aria-label={model.headline} style={{ maxWidth: 460 }}>
      <div
        aria-hidden="true"
        style={{
          width: 36,
          height: 2,
          background: "rgba(255, 255, 255, 0.45)",
          marginBottom: t.sizeMD,
        }}
      />

      <Title
        level={2}
        style={{
          margin: 0,
          marginBottom: t.sizeSM,
          color: "#ffffff",
          fontWeight: 600,
          fontSize: 30,
          lineHeight: 1.2,
          letterSpacing: "-0.015em",
        }}
      >
        {model.headline}
      </Title>

      <Paragraph
        style={{
          margin: 0,
          marginBottom: t.sizeLG,
          color: "rgba(255, 255, 255, 0.84)",
          fontSize: t.fontSizeLG,
          lineHeight: 1.6,
        }}
      >
        {model.body}
      </Paragraph>

      <Flex align="center" wrap="wrap" gap={t.sizeMD}>
        <Link
          ref={onCtaRef}
          to={model.signUpHref}
          onClick={onCtaClick}
          className="auth-editorial-cta"
        >
          <span>{CANDIDATE_SIGNUP_UI_COPY.loginEditorialCta}</span>
          <ArrowRightOutlined aria-hidden="true" />
        </Link>

        <button
          type="button"
          onClick={onOpenGuide}
          className="auth-editorial-guide-trigger"
        >
          <QuestionCircleOutlined aria-hidden="true" />
          <span>{CANDIDATE_SIGNUP_UI_COPY.loginHowToApplyLabel}</span>
        </button>
      </Flex>
    </section>
  );
}
