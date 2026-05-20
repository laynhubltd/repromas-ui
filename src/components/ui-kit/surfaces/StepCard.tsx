/**
 * StepCard — a guided step indicator card for multi-step empty states and onboarding flows.
 *
 * Renders a numbered (or check-marked) badge, an icon, a title, and a description.
 * Visual state is driven by the `done` and `active` props:
 *   - done=true  → green success styling with a ✓ badge
 *   - active=true → primary blue styling, draws the user's attention
 *   - neither    → neutral/muted styling (step not yet reachable)
 *
 * @example
 * <StepCard
 *   stepNumber={1}
 *   icon={<UserOutlined />}
 *   title="Select a Program"
 *   description="Choose the academic program from the list."
 *   done={hasProgram}
 *   active={!hasProgram}
 * />
 */
import { CheckCircleFilled } from "@ant-design/icons";
import { Flex, Typography, theme } from "antd";
import type { ReactNode } from "react";
import type { UIKitCommonProps } from "../foundation";

export interface StepCardProps extends UIKitCommonProps {
  /** The 1-based step number shown in the badge when the step is not yet done. */
  stepNumber: number;
  /** Icon rendered in the centre of the card. Any ReactNode — typically an Ant Design icon. */
  icon: ReactNode;
  /** Short step title. */
  title: string;
  /** One-line description of what the user should do. */
  description: string;
  /** When true the card renders in green "completed" styling with a ✓ badge. */
  done?: boolean;
  /** When true the card renders in primary-blue "current step" styling. */
  active?: boolean;
}

export function StepCard({
  stepNumber,
  icon,
  title,
  description,
  done = false,
  active = false,
  style,
  className,
  "data-testid": testId,
  "aria-label": ariaLabel,
}: StepCardProps) {
  const { token } = theme.useToken();

  const borderColor = done
    ? token.colorSuccess
    : active
      ? token.colorPrimary
      : token.colorBorderSecondary;

  const bgColor = done
    ? token.colorSuccessBg
    : active
      ? token.colorPrimaryBg
      : token.colorBgContainer;

  const badgeBg = done
    ? token.colorSuccess
    : active
      ? token.colorPrimary
      : token.colorTextQuaternary;

  const iconColor = done
    ? token.colorSuccess
    : active
      ? token.colorPrimary
      : token.colorTextTertiary;

  const titleColor = done
    ? token.colorSuccess
    : active
      ? token.colorPrimary
      : token.colorText;

  return (
    <div
      className={className}
      data-testid={testId}
      aria-label={ariaLabel}
      style={{
        flex: 1,
        minWidth: 180,
        padding: `${token.paddingMD}px ${token.paddingLG}px`,
        background: bgColor,
        border: `1.5px solid ${borderColor}`,
        borderRadius: token.borderRadiusLG,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: token.marginSM,
        transition: "all 0.25s ease",
        position: "relative",
        ...style,
      }}
    >
      {/* Floating step badge */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -12,
          left: "50%",
          transform: "translateX(-50%)",
          width: 24,
          height: 24,
          borderRadius: "50%",
          background: badgeBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: token.fontSizeSM,
          fontWeight: token.fontWeightStrong,
          color: token.colorWhite,
          boxShadow: token.boxShadowSecondary,
        }}
      >
        {done ? <CheckCircleFilled style={{ fontSize: 14 }} /> : stepNumber}
      </div>

      {/* Step icon */}
      <Flex
        align="center"
        justify="center"
        style={{
          fontSize: 28,
          color: iconColor,
          marginTop: token.marginXS,
        }}
      >
        {icon}
      </Flex>

      {/* Title */}
      <Typography.Text
        strong
        style={{
          fontSize: token.fontSize,
          color: titleColor,
          textAlign: "center",
          display: "block",
        }}
      >
        {title}
      </Typography.Text>

      {/* Description */}
      <Typography.Text
        type="secondary"
        style={{
          fontSize: token.fontSizeSM,
          textAlign: "center",
          display: "block",
        }}
      >
        {description}
      </Typography.Text>
    </div>
  );
}
