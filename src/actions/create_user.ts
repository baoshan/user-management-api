/* --- remote dependencies --- */
import { type Either, isLeft, left, right } from 'fp-ts/lib/Either.js'

/* --- local dependencies --- */
import { sql } from '../utils/postgres.js'
import { parseNewUser } from '../utils/parse_user.js'
import { checkConflictEmail } from '../utils/check_conflict_email.js'
import type { AuthenticatedUser, Error, UserProfile } from '../types.js'
import { signJWT } from '../utils/sign_jwt.js'
import bcrypt from 'bcrypt'

/**
 * Register client provided user in the database.
 * @param user Client provided user to be created.
 * @returns Either a non-empty array of `CheckUserError` or a valid user.
 */
export async function createUser (
  user: object
): Promise<Either<Error[], AuthenticatedUser>> {
  const checkResult = parseNewUser(user)

  if (isLeft(checkResult)) {
    return left(checkResult.left)
  } else {
    try {
      const newUser = checkResult.right
      const password = await bcrypt.hash(newUser.password, 10)
      const user = (await sql`
        INSERT INTO users (name, email, password)
        VALUES (${newUser.name}, ${newUser.email}, ${password})
        RETURNING users.id, users.name, users.email, users.admin
        `)[0] as UserProfile
      return right({
        id: user.id,
        name: user.name,
        email: user.email,
        admin: user.admin,
        jwt: signJWT(user.id, user.admin)
      })
    } catch (error) {
      return left([checkConflictEmail(error)])
    }
  }
}
