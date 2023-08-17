/* --- remote dependencies --- */
import { type Either, left, right } from 'fp-ts/lib/Either.js'

/* --- local dependencies --- */
import { sql } from '../utils/postgres.js'
import { idPattern } from '../utils/parse_user.js'
import { invalidIdError } from '../utils/non_parsing_errors.js'
import type { Error } from '../types.js'

/**
 * Delete an existing user.
 * @param id The id of the user to delete.
 * @returns Either an non-empty array of errors or undefined when no error is
 * found.
 */
export async function deleteUser (
  id: unknown
): Promise<Either<Error[], undefined>> {
  if (typeof id !== 'string' || !idPattern.test(id)) {
    return left([invalidIdError])
  }

  await sql`DELETE FROM users WHERE id = ${id}`
  return right(undefined)
}
