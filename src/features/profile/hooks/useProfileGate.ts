import { appPaths } from "@/app/routing/app-path";
import { normalizeStudentPortalScope } from "@/features/access-control/student-portal-scopes";
import useAuthState from "@/features/auth/use-auth-state";
import { useLocation } from "react-router-dom";

export function useProfileGate() {
  const location = useLocation();
  const { userProfile, activeRole } = useAuthState();

  const scope = normalizeStudentPortalScope(activeRole?.scope);
  const isStudentPortalUser = scope !== null;
  const hasProfilePicture = Boolean(userProfile?.profilePictureUrl);
  const isOnProfilePage = location.pathname === appPaths.profile;

  const needsUpload =
    isStudentPortalUser && !hasProfilePicture && !isOnProfilePage;

  return {
    flags: {
      needsUpload,
      isOnProfilePage,
    },
  };
}
