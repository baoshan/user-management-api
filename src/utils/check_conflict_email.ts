import { PostgresError } from './postgres.js'
import { emailConflictError } from './non_validation_errors.js'
import type { Error } from '../types.js'

export function checkConflictEmail (error: unknown): Error {
  if (error instanceof PostgresError) {
    switch (error.constraint_name) {
      case 'users_email_key':
        return emailConflictError
    }
  }
  throw error
}
