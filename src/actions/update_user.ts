/* --- remote dependencies --- */
import bcrypt from 'bcrypt'
import { type Either, isLeft, left, right } from 'fp-ts/lib/Either.js'

/* --- local dependencies --- */
import { sql } from '../utils/postgres.js'
import { idPattern, parsePartialUser } from '../utils/parse_user.js'
import { invalidIdError } from '../utils/non_validation_errors.js'
import { checkConflictEmail } from '../utils/check_conflict_email.js'
import type { Error } from '../types.js'

export async function updateUser (
  id: unknown,
  user: object
): Promise<Either<Error[], { status: 'success' }>> {
  if (typeof id !== 'string' || !idPattern.test(id)) {
    return left([invalidIdError])
  }
  const checkResult = parsePartialUser(user)
  if (isLeft(checkResult)) {
    return left(checkResult.left)
  } else {
    try {
      let user = checkResult.right
      const name = user.name ?? null
      const email = user.email ?? null
      const password = user.password
        ? await bcrypt.hash(user.password, 10)
        : null;
      [user] = await sql`
        UPDATE users SET
          name = COALESCE(${name}, users.name),
          email = COALESCE(${email}, users.email),
          password = COALESCE(${password}, users.password)
        WHERE id = ${id}
        `
      return right({ status: 'success' })
    } catch (error) {
      return left([checkConflictEmail(error)])
    }
  }
}
