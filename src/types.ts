/** User to be created. */
export interface NewUser {
  name: string
  email: string
  password: string
}

/** User persisted in PostgreSQL. */
export type UserRow = NewUser & {
  id: string
  admin: boolean
}

/** User returned from get user endpoints. */
export type UserProfile = Omit<UserRow, 'password'>

/** User returned from create user or authentication endpoints. */
export type AuthenticatedUser = UserProfile & {
  jwt: string
}

/** Error returned from APIs. */
export interface Error {
  code:
  | 'SYNTAX_ERROR'
  | 'UNAUTHORIZED_REQUEST'
  | 'PERMISSION_DENIED'
  | 'USER_ID_MALFORMED'
  | 'USER_NAME_INVALID'
  | 'USER_EMAIL_INVALID'
  | 'USER_PASSWORD_INVALID'
  | 'USER_EMAIL_CONFLICT'
  message: string
}
