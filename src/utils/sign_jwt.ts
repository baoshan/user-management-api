import jsonwebtoken from 'jsonwebtoken'

/** Sign JWT payload containing specified `sub` */
export function signJWT (sub: string, admin: boolean): string {
  return jsonwebtoken.sign(
    { sub, admin, iss: 'users.acme.com' },
    process.env.JWT_SECRET ?? '',
    { expiresIn: '30 minutes' }
  )
}
