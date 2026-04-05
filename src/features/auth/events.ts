import { createAction } from '@reduxjs/toolkit'
import type { ApiRole, LoginResponse, TokenResponse, UserProfile } from './types'

export const userLoggedIn = createAction<LoginResponse>('auth/userLoggedIn')
export const userLoggedOut = createAction('auth/userLoggedOut')
export const tokenRefreshed = createAction<TokenResponse>('auth/tokenRefreshed')
export const profileFetched = createAction<UserProfile>('auth/profileFetched')
export const authCleared = createAction('auth/authCleared')

export const roleSelected = createAction<ApiRole>('auth/roleSelected')
export const roleSwitched = createAction<ApiRole>('auth/roleSwitched')
