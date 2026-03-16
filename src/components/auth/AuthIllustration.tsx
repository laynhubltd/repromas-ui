import { useToken } from "@/hooks/useToken";
import React from "react";

export type AuthIllustrationVariant = "login" | "signup" | "reset";

interface AuthIllustrationProps {
  variant?: AuthIllustrationVariant;
}

const baseStyle: React.CSSProperties = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "125%",
  height: "125%",
  opacity: 1,
  pointerEvents: "none",
};

/**
 * Line-based auth background: strokes only, no fills. Minimal line-art style.
 */
export const AuthIllustration: React.FC<AuthIllustrationProps> = ({
  variant = "login",
}) => {
  const t = useToken();
  const c = t.colorPrimary as string;
  const stroke = (op: number) => ({
    stroke: c,
    strokeWidth: 1.5,
    fill: "none" as const,
    opacity: op,
  });

  const illustrations: Record<AuthIllustrationVariant, React.ReactNode> = {
    login: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 900 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={baseStyle}
      >
        {/* Abstract background shapes */}
        <circle cx="160" cy="140" r="120" {...stroke(0.08)} strokeDasharray="8 6" />
        <circle cx="740" cy="160" r="110" {...stroke(0.06)} strokeDasharray="6 8" />
        <circle cx="750" cy="540" r="115" {...stroke(0.07)} strokeDasharray="8 6" />
        <circle cx="140" cy="560" r="100" {...stroke(0.06)} strokeDasharray="6 8" />
        
        {/* Main illustration elements: Open Book */}
        <path d="M 280 220 L 440 220 L 440 440 L 280 440 Z" {...stroke(0.2)} />
        <path d="M 460 220 L 620 220 L 620 440 L 460 440 Z" {...stroke(0.2)} />
        <path d="M 460 220 L 460 440" stroke={c} strokeWidth="1.5" opacity="0.3" />
        
        {/* Abstract knowledge flow lines */}
        <path d="M 360 220 L 360 180 L 400 160" {...stroke(0.15)} />
        <path d="M 540 220 L 540 180 L 500 160" {...stroke(0.15)} />
        <path d="M 320 440 L 320 480 L 380 500" {...stroke(0.15)} />
        <path d="M 580 440 L 580 480 L 520 500" {...stroke(0.15)} />

        {/* Graduation cap element */}
        <path d="M 400 120 L 500 120 L 500 140 L 450 160 L 400 140 Z" fill={c} opacity="0.2" />
        <line x1="450" y1="160" x2="450" y2="180" stroke={c} strokeWidth="1.5" opacity="0.3" />
        <circle cx="450" cy="180" r="5" fill={c} opacity="0.4" />

        {/* Additional decorative elements (more dynamic) */}
        <path d="M 200 300 C 250 250, 300 250, 350 300" {...stroke(0.1)} strokeDasharray="4 2" />
        <path d="M 550 300 C 600 250, 650 250, 700 300" {...stroke(0.1)} strokeDasharray="4 2" />
        <rect x="180" y="380" width="40" height="40" rx="5" ry="5" fill={c} opacity="0.08" />
        <rect x="680" y="280" width="30" height="30" rx="5" ry="5" fill={c} opacity="0.08" />
      </svg>
    ),

    /* Signup: diploma – lines only */
    signup: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 900 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={baseStyle}
      >
        <circle
          cx="150"
          cy="150"
          r="125"
          {...stroke(0.11)}
          strokeDasharray="8 6"
        />
        <circle
          cx="750"
          cy="140"
          r="118"
          {...stroke(0.1)}
          strokeDasharray="6 8"
        />
        <circle
          cx="760"
          cy="550"
          r="120"
          {...stroke(0.11)}
          strokeDasharray="8 6"
        />
        <circle
          cx="130"
          cy="560"
          r="108"
          {...stroke(0.1)}
          strokeDasharray="6 8"
        />
        <path
          d="M 320 220 L 580 220 L 620 260 L 620 440 L 580 480 L 320 480 L 280 440 L 280 260 Z"
          {...stroke(0.38)}
        />
        <path d="M 380 280 L 520 280" {...stroke(0.28)} />
        <path d="M 380 320 L 500 320" {...stroke(0.28)} />
        <path d="M 380 360 L 480 360" {...stroke(0.25)} />
        <path
          d="M 450 480 L 430 560 M 450 480 L 470 560"
          stroke={c}
          strokeWidth="1.5"
          fill="none"
          opacity={0.3}
        />
      </svg>
    ),

    /* Reset: envelope – lines only */
    reset: (
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 900 700"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={baseStyle}
      >
        <circle
          cx="160"
          cy="160"
          r="125"
          {...stroke(0.11)}
          strokeDasharray="8 6"
        />
        <circle
          cx="740"
          cy="150"
          r="118"
          {...stroke(0.1)}
          strokeDasharray="6 8"
        />
        <circle
          cx="750"
          cy="530"
          r="122"
          {...stroke(0.11)}
          strokeDasharray="8 6"
        />
        <circle
          cx="140"
          cy="540"
          r="105"
          {...stroke(0.1)}
          strokeDasharray="6 8"
        />
        <path
          d="M 280 260 L 450 380 L 620 260 L 620 460 L 280 460 Z"
          {...stroke(0.36)}
        />
        <path
          d="M 280 260 L 450 360 L 620 260"
          stroke={c}
          strokeWidth="2"
          fill="none"
          opacity={0.4}
        />
        <path d="M 450 360 L 450 460" {...stroke(0.25)} />
      </svg>
    ),
  };

  return (
    <div
      style={{
        opacity: 0.4,
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
      }}
    >
      {illustrations[variant]}
    </div>
  );
};
