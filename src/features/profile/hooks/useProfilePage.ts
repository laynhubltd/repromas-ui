import useAuthState from "@/features/auth/use-auth-state";

export function useProfilePage() {
  const { userProfile, activeRole } = useAuthState();

  const displayName =
    userProfile?.firstName && userProfile?.lastName
      ? `${userProfile.firstName} ${userProfile.lastName}`
      : (userProfile?.email ?? "User");

  return {
    state: {
      displayName,
      email: userProfile?.email ?? "",
      firstName: userProfile?.firstName,
      lastName: userProfile?.lastName,
      profilePictureUrl: userProfile?.profilePictureUrl,
      roleLabel: activeRole?.name,
    },
    flags: {
      hasExistingProfilePicture: Boolean(userProfile?.profilePictureUrl),
    },
  };
}
