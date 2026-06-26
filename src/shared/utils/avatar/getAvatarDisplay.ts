export type AvatarDisplayInput = {
  profilePictureUrl?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

export type AvatarDisplay = {
  src: string | undefined;
  initials: string | undefined;
};

export function getAvatarInitials(
  firstName?: string | null,
  lastName?: string | null,
  email?: string | null,
): string | undefined {
  const fromNames = [firstName?.[0], lastName?.[0]]
    .filter(Boolean)
    .join("")
    .toUpperCase();

  if (fromNames) return fromNames;

  const emailInitial = email?.trim()?.[0]?.toUpperCase();
  return emailInitial || undefined;
}

export function getAvatarDisplay(input: AvatarDisplayInput): AvatarDisplay {
  const src = input.profilePictureUrl?.trim() || undefined;
  const initials = src
    ? undefined
    : getAvatarInitials(input.firstName, input.lastName, input.email);

  return { src, initials };
}
