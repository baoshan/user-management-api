import app from '../src/app.js'
import request from 'supertest'

import { signJWT } from '../src/utils/sign_jwt.js'
import { generateRandomNewUser } from './utils.js'

describe('Delete the authenticated user', () => {
  it('succeeds', async () => {
    const { body: user } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect('Content-Type', /json/)
      .expect(201)

    await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${user.jwt}`)
      .expect(200)

    await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${user.jwt}`)
      .expect(204)

    await request(app) // is idempotent
      .delete('/user')
      .set('Authorization', `Bearer ${user.jwt}`)
      .expect(204)

    await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${user.jwt}`)
      .expect(404)
  })

  it('rejects unauthorized requests', async () => {
    await request(app)
      .delete('/user')
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects unauthorized requests (alt)', async () => {
    await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${signJWT('', false)}`)
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects malformed user ids', async () => {
    await request(app)
      .delete('/user')
      .set('Authorization', `Bearer ${signJWT('non-id', false)}`)
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })
})
