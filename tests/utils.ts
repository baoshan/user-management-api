import crypto from 'crypto'
import type { NewUser } from '../src/types.js'
import { signJWT } from '../src/utils/sign_jwt.js'

export function generateRandomUUID (): string {
  return crypto.randomUUID()
}

export function generateRandomString (charCount: number): string {
  return crypto.randomBytes(charCount / 2).toString('hex')
}

export function generateRandomName (): string {
  return generateRandomString(8)
}

export function generateRandomEmail (): string {
  return `${generateRandomString(10)}@acme.com`
}

export function generateRandomPassword (): string {
  return generateRandomString(8)
}

export function generateRandomNewUser (): NewUser {
  return {
    name: generateRandomName(),
    email: generateRandomEmail(),
    password: generateRandomPassword()
  }
}

export function generateRandomAdminJWT (): string {
  return signJWT(generateRandomUUID(), true)
}
