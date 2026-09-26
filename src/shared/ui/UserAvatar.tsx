import { UserOutlined } from "@ant-design/icons";
import {
  blue,
  cyan,
  geekblue,
  gold,
  green,
  magenta,
  orange,
  purple,
} from "@ant-design/colors";
import { Avatar } from "antd";
import type { CSSProperties, ReactNode } from "react";
import { useToken } from "@/shared/hooks/useToken";
import { getAvatarInitials } from "@/shared/utils/avatar/getAvatarDisplay";

export type UserAvatarProps = {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  displayName?: string;
  size?: number;
  icon?: ReactNode;
  /** Accessible description for the photo; defaults to the user's display name. */
  alt?: string;
};

const DEFAULT_AVATAR_SIZE = 40;

/**
 * Curated identity palette (Ant Design color presets).
 *
 * Pastel background (preset[0], ≈ the "-50" tint) with dark same-hue initials
 * (preset[7], ≈ "-700") — contrast-safe by construction rather than by luck,
 * unlike free-hue hashing. Red/volcano are deliberately excluded so a fallback
 * avatar never reads as an error state.
 */
const IDENTITY_PALETTE = [
  blue,
  geekblue,
  cyan,
  green,
  purple,
  magenta,
  orange,
  gold,
].map((preset) => ({
  background: preset[0],
  color: preset[7],
  border: preset[2],
}));

/**
 * Stable string hash (djb2). The palette slot must never change between
 * sessions or renders — an unstable color quietly destroys recognisability.
 */
function hashSeed(seed: string): number {
  let hash = 5381;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 33) ^ seed.charCodeAt(i);
  }
  return Math.abs(hash);
}

export function UserAvatar({
  src,
  firstName,
  lastName,
  email,
  displayName,
  size = DEFAULT_AVATAR_SIZE,
  icon,
  alt,
}: UserAvatarProps) {
  const token = useToken();
  const imageSrc = src?.trim() || undefined;

  // Initials priority: structured name → display name → email (last resort).
  const displayNameInitials =
    displayName
      ?.trim()
      .split(/\s+/)
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || undefined;

  const initials =
    getAvatarInitials(firstName, lastName, null) ??
    displayNameInitials ??
    email?.trim()?.[0]?.toUpperCase();

  // Identity seed: email is the most stable identifier, then full name.
  const seed =
    email?.trim().toLowerCase() ||
    [firstName, lastName].filter(Boolean).join(" ").toLowerCase() ||
    displayName?.toLowerCase() ||
    "";
  const identity = IDENTITY_PALETTE[hashSeed(seed) % IDENTITY_PALETTE.length];

  // Initials scale with the avatar instead of a fixed small font.
  const initialsFontSize = Math.max(10, Math.round(size * 0.38));

  const accessibleName =
    alt ?? displayName ?? [firstName, lastName].filter(Boolean).join(" ");

  const sharedStyle: CSSProperties = {
    flexShrink: 0,
  };

  if (imageSrc) {
    // Photo avatars: quiet 1px definition ring from the theme — rings and
    // shadows are reserved for state (selection, presence), not decoration.
    // Initials children act as the automatic fallback if the image fails.
    return (
      <Avatar
        src={imageSrc}
        alt={accessibleName}
        size={size}
        style={{
          ...sharedStyle,
          border: `1px solid ${token.colorBorderSecondary}`,
          backgroundColor: identity.background,
          color: identity.color,
          fontWeight: 600,
          fontSize: initialsFontSize,
        }}
      >
        {initials}
      </Avatar>
    );
  }

  if (initials) {
    return (
      <Avatar
        size={size}
        aria-label={accessibleName || undefined}
        style={{
          ...sharedStyle,
          backgroundColor: identity.background,
          color: identity.color,
          border: `1px solid ${identity.border}`,
          fontWeight: 600,
          fontSize: initialsFontSize,
          letterSpacing: "0.02em",
        }}
      >
        {initials}
      </Avatar>
    );
  }

  return (
    <Avatar
      icon={icon ?? <UserOutlined />}
      size={size}
      aria-label={accessibleName || "User"}
      style={{
        ...sharedStyle,
        backgroundColor: token.colorFillSecondary,
        color: token.colorTextSecondary,
        border: `1px solid ${token.colorBorderSecondary}`,
      }}
    />
  );
}
