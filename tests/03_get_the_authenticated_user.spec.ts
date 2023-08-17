/* --- remote dependencies --- */
import request from 'supertest'

/* --- local dependencies --- */
import app from '../src/app.js'
import { signJWT } from '../src/utils/sign_jwt.js'
import { generateRandomNewUser, generateRandomUUID } from './utils.js'

describe('Get the authenticated user', () => {
  it('succeeds', async () => {
    const user = generateRandomNewUser()

    const { body: { id, jwt } } = await request(app)
      .post('/users')
      .send(user)
      .expect(201)

    await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${jwt}`)
      .expect(200, {
        id,
        name: user.name,
        email: user.email,
        admin: false
      })
  })

  it('returns 404 for non-existing user', async () => {
    await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${signJWT(generateRandomUUID(), false)}`)
      .expect(404)
  })

  it('rejects unauthorized requests', async () => {
    await request(app)
      .get('/user')
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects malformed user ids (1)', async () => {
    await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${signJWT('', false)}`)
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })

  it('rejects malformed user ids (2)', async () => {
    await request(app)
      .get('/user')
      .set('Authorization', `Bearer ${signJWT('malformed-user-id', false)}`)
      .expect(422, [{
        code: 'USER_ID_MALFORMED',
        message: 'User ID should be a UUID.'
      }])
  })
})
