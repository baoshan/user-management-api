import { sql } from '../utils/postgres.js'
import type { UserProfile, Error } from '../types.js'
import { type Either, left, right } from 'fp-ts/lib/Either.js'
import { idPattern } from '../utils/parse_user.js'
import { invalidIdError } from '../utils/non_validation_errors.js'

export async function retrieveUser (
  id: unknown
): Promise<
  Either<Error[], UserProfile | undefined>
  > {
  if (typeof id !== 'string' || !idPattern.test(id)) {
    return left([invalidIdError])
  }

  const [user] = await sql`
  SELECT id, name, email, admin
    FROM users
   WHERE id = ${id}
  `
  return right(user as UserProfile | undefined)
}
