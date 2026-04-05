export type ApiRole = {
  name: string
  scope: string
  scopeReferenceId: string | null
}

export type LoginRequest = { email: string; password: string }
export type LoginResponse = {
  token: string
  refresh_token: string
  roles: ApiRole[]
  permissions: string[]
  user?: UserProfile
  profiles?: SimpleUserProfile[]
}
export type SignUpRequest = { email: string; password: string }
export type SignUpResponse = { message?: string }
export type ForgotPasswordRequest = { email: string }
export type UserProfile = {
  id: string
  firstName?: string
  lastName?: string
  email: string
  role?: UserRole
  company?: { id: string; name: string; type?: string }
}
export type UserRole = { name: string; scope?: string; scopeReferenceId?: string | null }
export type SimpleUserProfile = {
  profileId: string
  role: { name: string; description?: string }
  company: { id: string; name: string; type?: string }
}
export type TokenResponse = { accessToken?: string; refreshToken?: string }
