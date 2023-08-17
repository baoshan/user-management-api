import app from '../src/app.js'
import request from 'supertest'
import { signJWT } from '../src/utils/sign_jwt.js'
import {
  generateRandomEmail,
  generateRandomName,
  generateRandomNewUser,
  generateRandomPassword
} from './utils.js'
import { assert } from 'chai'

describe('Update the authenticated user', () => {
  it('succeeds (partial properties)', async () => {
    const { body: { jwt } } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect(201)

    const name = generateRandomName()
    const email = generateRandomEmail()
    const password = generateRandomPassword()

    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name })
      .expect(204)

    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ email })
      .expect(204)

    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ password })
      .expect(204)

    await request(app)
      .post('/auth')
      .send({ email, password })
      .expect(200)
      .then(({ body: user }) => {
        assert.equal(user.name, name)
      })
  })

  it('succeeds (full properties)', async () => {
    const { body: { jwt } } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect(201)

    const name = generateRandomName()
    const email = generateRandomEmail()
    const password = generateRandomPassword()

    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${jwt}`)
      .send({ name, email, password })
      .expect(204)

    await request(app)
      .post('/auth')
      .send({ email, password })
      .expect(200)
      .then(({ body: user }) => {
        assert.equal(user.name, name)
      })
  })

  it('rejects syntax errors', async () => {
    await request(app)
      .put('/user')
      .set('Content-Type', 'application/json')
      .send('foo')
      .expect(400, [{
        code: 'SYNTAX_ERROR',
        message: 'Syntax error.'
      }])
  })

  it('rejects unauthorized requests', async () => {
    await request(app)
      .put('/user')
      .send(generateRandomNewUser())
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects malormed user ids', async () => {
    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${signJWT('', false)}`)
      .send({})
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })

  it('rejects malormed user ids', async () => {
    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${signJWT('malformed-user-id', false)}`)
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })

  it('rejects invalid properties', async () => {
    const { body: { jwt } } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect(201)

    const newProperties = {
      name: '',
      email: '',
      password: ''
    }

    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${jwt}`)
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

    const { body: { jwt: jwt1 } } = await request(app)
      .post('/users')
      .send(newUser1)
      .expect(201)

    await request(app)
      .post('/users')
      .send(newUser2)
      .expect(201)

    await request(app)
      .put('/user')
      .set('Authorization', `Bearer ${jwt1}`)
      .send({ email: newUser2.email })
      .expect(422, [{
        code: 'USER_EMAIL_CONFLICT',
        message: 'Email is already taken.'
      }])
  })
})
