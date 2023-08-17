import bcrypt from 'bcrypt'
import { sql } from './postgres.js'
import { signJWT } from './sign_jwt.js'
import type { AuthenticatedUser, NewUser, UserRow } from '../types.js'

export async function createAdminUser (
  newUser: NewUser
): Promise<AuthenticatedUser> {
  const password = await bcrypt.hash(newUser.password, 10)
  const user = (await sql`
    INSERT INTO users (name, email, password, admin)
    VALUES (${newUser.name}, ${newUser.email}, ${password}, true)
    RETURNING users.id, users.name, users.email, users.admin
    `)[0] as UserRow
  const jwt = signJWT(user.id, true)
  const result: AuthenticatedUser = { ...user, jwt }
  return result
}
