/* --- remote dependencies --- */
import bcrypt from 'bcrypt'

/* --- local dependencies --- */
import { sql } from '../utils/postgres.js'
import type { AuthenticatedUser, UserRow } from '../types.js'
import { signJWT } from '../utils/sign_jwt.js'

/**
 * Authenticate using specified email and password.
 * @param email Email address provided by the client.
 * @param password Password provided by the client.
 * @returns An authenticated user if the credentials match. undefined
 * otherwise.
 */
export async function auth (
  email: string,
  password: string
): Promise<AuthenticatedUser | undefined> {
  if (typeof email !== 'string' || typeof password !== 'string') return
  const user = (await sql`
  SELECT id, name, email, password, admin
    FROM users
   WHERE LOWER(email) = LOWER(${email})
   `)[0] as UserRow | undefined
  if ((user == null) || !await bcrypt.compare(password, user.password)) return
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    admin: user.admin,
    jwt: signJWT(user.id, user.admin)
  }
}
