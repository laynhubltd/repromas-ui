import { normalizeStudentPortalScope } from "@/features/access-control/student-portal-scopes";
import useAuthState from "@/features/auth/use-auth-state";
import { PROFILE_PICTURE_REQUIRED_TOOLTIP } from "@/shared/constants/profilePageOptions";

export function useProfilePictureRequired() {
  const { userProfile, activeRole } = useAuthState();
  const scope = normalizeStudentPortalScope(activeRole?.scope);
  const isStudentPortalUser = scope !== null;
  const needsProfilePicture =
    isStudentPortalUser && !userProfile?.profilePictureUrl;

  return {
    needsProfilePicture,
    tooltipMessage: PROFILE_PICTURE_REQUIRED_TOOLTIP,
  };
}
