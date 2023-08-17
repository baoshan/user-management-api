import { type Either, left, right } from 'fp-ts/lib/Either.js'
import type { Error, NewUser } from '../types.js'

/** Parse user properties to update from client provided data. */
export function parsePartialUser (
  user: object
): Either<Error[], Partial<NewUser>> {
  const errors: Error[] = []
  const result: Partial<NewUser> = {}

  if ('name' in user) {
    if (typeof user.name === 'string' && namePattern.test(user.name)) {
      result.name = user.name
    } else {
      errors.push({ code: 'USER_NAME_INVALID', message: nameInvalid })
    }
  }

  if ('email' in user) {
    if (
      typeof user.email === 'string' &&
      emailPattern.test(user.email)
    ) {
      result.email = user.email
    } else {
      errors.push({ code: 'USER_EMAIL_INVALID', message: emailInvalid })
    }
  }

  if ('password' in user) {
    if (
      typeof user.password === 'string' &&
      passwordPattern.test(user.password)
    ) {
      result.password = user.password
    } else {
      errors.push({ code: 'USER_PASSWORD_INVALID', message: passwordInvalid })
    }
  }

  return (errors.length > 0) ? left(errors) : right(user)
}

/** Parse a new user to be registered from client provided data. */
export function parseNewUser (
  user: object
): Either<Error[], NewUser> {
  const errors: Error[] = []

  // check user name
  let name = ''
  if (
    'name' in user &&
    typeof user.name === 'string' &&
    namePattern.test(user.name)
  ) {
    name = user.name
  } else {
    errors.push({ code: 'USER_NAME_INVALID', message: nameInvalid })
  }

  // check user email
  let email = ''
  if (
    'email' in user &&
    typeof user.email === 'string' &&
    emailPattern.test(user.email)
  ) {
    email = user.email
  } else {
    errors.push({ code: 'USER_EMAIL_INVALID', message: emailInvalid })
  }

  // check user password
  let password = ''
  if (
    'password' in user &&
    typeof user.password === 'string' &&
    passwordPattern.test(user.password)
  ) {
    password = user.password
  } else {
    errors.push({ code: 'USER_PASSWORD_INVALID', message: passwordInvalid })
  }

  return (errors.length > 0) ? left(errors) : right({ name, email, password })
}

export const idPattern =
  /^[0-9a-f]{8}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{4}\b-[0-9a-f]{12}$/i

const namePattern = /\S+/
const nameInvalid = 'Name should be non-empty.'

const emailPattern = /^\S+@\S+$/
const emailInvalid = 'A valid email address is required.'

const passwordPattern = /^.{8,32}$/
const passwordInvalid = 'Password should be between 8 and 32 characters.'
