import request from 'supertest'

import app from '../src/app.js'
import { signJWT } from '../src/utils/sign_jwt.js'
import { generateRandomNewUser, generateRandomUUID } from './utils.js'

describe('Get an existing user', () => {
  it('succeeds', async () => {
    const newUser = generateRandomNewUser()
    const adminJWT = signJWT(generateRandomUUID(), true)

    const { body: { id } } = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201)

    await request(app)
      .get(`/users/${id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(200, {
        id,
        name: newUser.name,
        email: newUser.email,
        admin: false
      })
  })

  it('returns 404 for non-existing user', async () => {
    const adminJWT = signJWT(generateRandomUUID(), true)

    await request(app)
      .get('/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(404)
  })

  it('rejects unauthorized requests', async () => {
    await request(app)
      .get('/users/00000000-0000-0000-0000-000000000000')
      .send(generateRandomNewUser())
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects when permission is denied', async () => {
    const jwt = signJWT(generateRandomUUID(), false)

    await request(app)
      .get('/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(403, [{
        code: 'PERMISSION_DENIED',
        message: 'Permission denied.'
      }])
  })

  it('rejects malformed user id', async () => {
    const adminJWT = signJWT(generateRandomUUID(), true)

    await request(app)
      .get('/users/foo')
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })
})
