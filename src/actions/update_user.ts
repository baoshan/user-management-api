/* --- remote dependencies --- */
import bcrypt from 'bcrypt'
import { type Either, isLeft, left, right } from 'fp-ts/lib/Either.js'

/* --- local dependencies --- */
import { sql } from '../utils/postgres.js'
import { idPattern, parsePartialUser } from '../utils/parse_user.js'
import { invalidIdError } from '../utils/non_parsing_errors.js'
import { checkConflictEmail } from '../utils/check_conflict_email.js'
import type { Error } from '../types.js'

/**
 * Updates an existing user of specified id.
 * @param id Id of the user.
 * @param user Properties of a user to update.
 * @returns Either a non-empty array of errors or `undefined`.
 */
export async function updateUser (
  id: unknown,
  user: object
): Promise<Either<Error[], undefined>> {
  if (typeof id !== 'string' || !idPattern.test(id)) {
    return left([invalidIdError])
  }

  const checkResult = parsePartialUser(user)
  if (isLeft(checkResult)) return left(checkResult.left)

  try {
    const user = checkResult.right
    const name = user.name ?? null
    const email = user.email ?? null
    const password = user.password
      ? await bcrypt.hash(user.password, 10)
      : null

    await sql`
        UPDATE users
        SET
          name = COALESCE(${name}, users.name),
          email = COALESCE(${email}, users.email),
          password = COALESCE(${password}, users.password)
        WHERE id = ${id}
        `

    return right(undefined)
  } catch (error) {
    return left([checkConflictEmail(error)])
  }
}
