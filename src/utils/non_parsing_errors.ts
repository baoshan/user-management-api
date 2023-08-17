export const unauthorizedRequestError = {
  code: 'UNAUTHORIZED_REQUEST',
  message: 'Unauthorized request.'
} as const

export const syntaxError = {
  code: 'SYNTAX_ERROR',
  message: 'Syntax error.'
} as const

export const permissionDeniedError = {
  code: 'PERMISSION_DENIED',
  message: 'Permission denied.'
} as const

export const emailConflictError = {
  code: 'USER_EMAIL_CONFLICT',
  message: 'Email is already taken.'
} as const

export const invalidIdError = {
  code: 'USER_ID_MALFORMED',
  message: 'User ID should be a UUID.'
} as const
