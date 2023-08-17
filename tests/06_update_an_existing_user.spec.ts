/* --- remote dependencies --- */
import request from 'supertest'
import { assert } from 'chai'

/* --- local dependeencies --- */
import app from '../src/app.js'
import { signJWT } from '../src/utils/sign_jwt.js'
import {
  generateRandomEmail,
  generateRandomName,
  generateRandomNewUser,
  generateRandomPassword,
  generateRandomUUID
} from './utils.js'

describe('Update an existing user', () => {
  const adminJWT = signJWT(generateRandomUUID(), true)

  it('succeeds (partial properties)', async () => {
    const { body: { id } } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect(201)

    const name = generateRandomName()
    const email = generateRandomEmail()
    const password = generateRandomPassword()

    await request(app)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .send({ name })
      .expect(204)

    await request(app)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .send({ email })
      .expect(204)

    await request(app)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .send({ password })
      .expect(204)

    await request(app)
      .post('/auth')
      .send({ email, password })
      .expect(200)
      .then(({ body: user }) => {
        assert.equal(user.id, id)
        assert.equal(user.name, name)
      })
  })

  it('succeeds (full properties)', async () => {
    const { body: { id } } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect(201)

    const name = generateRandomName()
    const email = generateRandomEmail()
    const password = generateRandomPassword()

    await request(app)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .send({ name, email, password })
      .expect(204)

    await request(app)
      .post('/auth')
      .send({ email, password })
      .expect(200)
      .then(({ body: user }) => {
        assert.equal(user.id, id)
        assert.equal(user.name, name)
      })
  })

  it('rejects syntax errors', async () => {
    await request(app)
      .put('/users/00000000-0000-0000-0000-000000000000')
      .set('Content-Type', 'application/json')
      .send('foo')
      .expect(400, [{
        code: 'SYNTAX_ERROR',
        message: 'Syntax error.'
      }])
  })

  it('rejects unauthorized requests', async () => {
    await request(app)
      .put('/users/00000000-0000-0000-0000-000000000000')
      .send(generateRandomNewUser())
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects when permission is denied', async () => {
    await request(app)
      .put('/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${signJWT('', false)}`)
      .send({})
      .expect(403, [{
        code: 'PERMISSION_DENIED',
        message: 'Permission denied.'
      }])
  })

  it('rejects malformed user ids', async () => {
    await request(app)
      .put('/users/malformed-user-id')
      .set('Authorization', `Bearer ${adminJWT}`)
      .send({})
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })

  it('rejects invalid properties', async () => {
    const { body: { id } } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect(201)

    const newProperties = {
      name: '',
      email: '',
      password: ''
    }

    await request(app)
      .put(`/users/${id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .send(newProperties)
      .expect(422, [{
        code: 'USER_NAME_INVALID',
        message: 'Name should be non-empty.'
      }, {
        code: 'USER_EMAIL_INVALID',
        message: 'A valid email address is required.'
      }, {
        code: 'USER_PASSWORD_INVALID',
        message: 'Password should be between 8 and 32 characters.'
      }])
  })

  it('rejects conflicting emails', async () => {
    const newUser1 = generateRandomNewUser()
    const newUser2 = generateRandomNewUser()

    const { body: { id: id1 } } = await request(app)
      .post('/users')
      .send(newUser1)
      .expect(201)

    await request(app)
      .post('/users')
      .send(newUser2)
      .expect(201)

    await request(app)
      .put(`/users/${id1}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .send({ email: newUser2.email })
      .expect(422, [{
        code: 'USER_EMAIL_CONFLICT',
        message: 'Email is already taken.'
      }])
  })
})
