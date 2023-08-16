/* --- remote dependencies ---- */
import request from 'supertest'

/* --- local dependencies ---- */
import app from '../src/app.js'
import { generateRandomAdminJWT, generateRandomNewUser } from './utils.js'
import { sql } from '../src/utils/postgres.js'

describe('Delete an existing user', () => {
  const adminJWT = generateRandomAdminJWT()

  it('succeeds', async () => {
    const { body: user } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect(201)

    await request(app)
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(200)

    await request(app)
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(204)

    await request(app) // is idempotent
      .delete(`/users/${user.id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(204)

    await request(app)
      .get(`/users/${user.id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(404)
  })

  it('rejects unauthorized requests', async () => {
    await request(app)
      .delete('/users/foo')
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects when permission is denied', async () => {
    const { body: { id, jwt } } = await request(app)
      .post('/users')
      .send(generateRandomNewUser())
      .expect('Content-Type', /json/)
      .expect(201)

    await request(app)
      .delete(`/users/${id}`)
      .set('Authorization', `Bearer ${jwt}`)
      .expect(403, [{
        code: 'PERMISSION_DENIED',
        message: 'Permission denied.'
      }])

    await request(app)
      .get(`/users/${id}`)
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(200)
  })

  it('rejects malformed user ids', async () => {
    await request(app)
      .delete('/users/malformed-user-id')
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })

  it('response 500 for internals errors', async () => {
    await sql.end()

    await request(app)
      .delete('/users/00000000-0000-0000-0000-000000000000')
      .set('Authorization', `Bearer ${adminJWT}`)
      .expect(500)
  })
})
