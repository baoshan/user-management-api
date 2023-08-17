import { PostgresError } from './postgres.js'
import { emailConflictError } from './non_parsing_errors.js'
import type { Error } from '../types.js'

/**
 * Returns `USER_EMAIL_CONFLICT` error for Postgres error caused by conflicting
 * email, throws other errors.
 */
export function checkConflictEmail (error: unknown): Error {
  if (error instanceof PostgresError) {
    switch (error.constraint_name) {
      case 'users_email_key':
        return emailConflictError
    }
  }
  throw error
}
