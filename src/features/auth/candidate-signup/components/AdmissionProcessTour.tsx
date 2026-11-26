import { CANDIDATE_SIGNUP_UI_COPY } from "@/shared/constants/candidateSignupOptions";
import { useToken } from "@/shared/hooks/useToken";
import { ArrowRightOutlined } from "@ant-design/icons";
import type { TourProps } from "antd";
import { Button, Flex, Tour, Typography } from "antd";
import { useMemo } from "react";
import type { AdmissionEditorialModel } from "../utils/buildAdmissionEditorialModel";

const { Text } = Typography;

const TOUR_STYLES: TourProps["styles"] = {
  root: {
    width: 340,
    maxWidth: "calc(100vw - 32px)",
  },
};

const TOUR_SCROLL_OPTIONS: ScrollIntoViewOptions = {
  block: "nearest",
  inline: "nearest",
};

type AdmissionProcessTourProps = {
  open: boolean;
  target: HTMLElement | null;
  model: AdmissionEditorialModel;
  onClose: () => void;
  onStartRegistration: () => void;
};

/** Non-blocking directional tour highlighting the 3-step admission process. */
export function AdmissionProcessTour({
  open,
  target,
  model,
  onClose,
  onStartRegistration,
}: AdmissionProcessTourProps) {
  const t = useToken();

  const steps = useMemo<NonNullable<TourProps["steps"]>>(
    () =>
      target
        ? [
            {
              title: CANDIDATE_SIGNUP_UI_COPY.loginTourTitle,
              target: () => target,
              description: (
                <Flex vertical gap={t.sizeSM} style={{ paddingTop: t.sizeXXS }}>
                  {model.steps.map((step) => (
                    <Flex key={step.stepNumber} align="flex-start" gap={t.sizeXS}>
                      <span
                        aria-hidden="true"
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: "50%",
                          background: t.colorPrimaryBg,
                          color: t.colorPrimary,
                          fontSize: t.fontSizeSM,
                          fontWeight: t.fontWeightStrong,
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          marginTop: 1,
                        }}
                      >
                        {step.stepNumber}
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <Text
                          strong
                          style={{
                            display: "block",
                            fontSize: t.fontSizeSM,
                            color: t.colorText,
                          }}
                        >
                          {step.title}
                        </Text>
                        <Text
                          type="secondary"
                          style={{
                            display: "block",
                            fontSize: t.fontSizeSM,
                            lineHeight: 1.45,
                          }}
                        >
                          {step.description}
                        </Text>
                      </div>
                    </Flex>
                  ))}
                </Flex>
              ),
              actionsRender: () => (
                <Flex align="center" justify="flex-end" gap={t.sizeXS}>
                  <Button size="small" onClick={onClose}>
                    {CANDIDATE_SIGNUP_UI_COPY.loginTourDismissLabel}
                  </Button>
                  <Button
                    type="primary"
                    size="small"
                    icon={<ArrowRightOutlined aria-hidden="true" />}
                    iconPlacement="end"
                    onClick={onStartRegistration}
                  >
                    {CANDIDATE_SIGNUP_UI_COPY.loginTourStartLabel}
                  </Button>
                </Flex>
              ),
            },
          ]
        : [],
    [model.steps, onClose, onStartRegistration, t, target],
  );

  if (!open || !target) {
    return null;
  }

  return (
    <Tour
      open={open}
      onClose={onClose}
      onFinish={onClose}
      mask={false}
      placement="topLeft"
      scrollIntoViewOptions={TOUR_SCROLL_OPTIONS}
      zIndex={1020}
      styles={TOUR_STYLES}
      steps={steps}
    />
  );
}
