import { baseApi } from "@/app/api/baseApi";
import { profilePictureUploaded } from "@/features/auth/events";
import type { ProfilePictureUploadResponse } from "../types/profile-picture";

const profileApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    uploadProfilePicture: builder.mutation<
      ProfilePictureUploadResponse,
      FormData
    >({
      query: (formData) => ({
        url: "/me/profile/picture",
        method: "POST",
        data: formData,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(
            profilePictureUploaded({
              profilePictureUrl: data.profilePictureUrl,
            }),
          );
        } catch {
          // Error handling is done in the hook via useApiError.
        }
      },
    }),
  }),
});

export const { useUploadProfilePictureMutation } = profileApi;

export default profileApi;
