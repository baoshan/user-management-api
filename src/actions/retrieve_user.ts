/* --- remote dependencies --- */
import { type Either, left, right } from 'fp-ts/lib/Either.js'

/* --- local dependencies --- */
import { sql } from '../utils/postgres.js'
import { idPattern } from '../utils/parse_user.js'
import { invalidIdError } from '../utils/non_parsing_errors.js'
import type { Error, UserProfile } from '../types.js'

/**
 * Retrieve an user of specified id.
 * @param id Id of the user.
 * @returns Either an array of non-empty errors or an user (or undefined when
 * user of the id does not exist).
 */
export async function retrieveUser (
  id: unknown
): Promise<
  Either<Error[], UserProfile | undefined>
  > {
  if (typeof id !== 'string' || !idPattern.test(id)) {
    return left([invalidIdError])
  }

  const user = (await sql`
  SELECT id, name, email, admin
    FROM users
   WHERE id = ${id}
  `)[0] as UserProfile | undefined

  return right(user)
}
