import { type Either, left, right } from 'fp-ts/lib/Either.js'
import { sql } from '../utils/postgres.js'
import { idPattern } from '../utils/parse_user.js'
import { invalidIdError } from '../utils/non_validation_errors.js'
import type { Error } from '../types.js'

export async function deleteUser (
  id: string
): Promise<Either<Error[], undefined>> {
  if (!idPattern.test(id)) return left([invalidIdError])
  await sql`DELETE FROM users WHERE id = ${id}`
  return right(undefined)
}
