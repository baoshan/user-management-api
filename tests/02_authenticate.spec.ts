/* --- remote dependencies --- */
import request from 'supertest'
import { assert } from 'chai'

/* --- local dependencies --- */
import app from '../src/app.js'
import { generateRandomNewUser } from './utils.js'

describe('Authenticate', () => {
  it('succeeds', async () => {
    const newUser = generateRandomNewUser()

    await request(app)
      .post('/users')
      .send(newUser)
      .expect(201)

    await request(app)
      .post('/auth')
      .send({ email: newUser.email, password: newUser.password })
      .expect(200)
      .then(({ body: user }) => {
        assert.equal(user.name, newUser.name)
        assert.equal(user.email, newUser.email)
        assert.equal(user.admin, false)
      })
  })

  it('rejects syntax error', async () => {
    await request(app)
      .post('/auth')
      .set('Content-Type', 'application/json')
      .send('foo')
      .expect(400, [{
        code: 'SYNTAX_ERROR',
        message: 'Syntax error.'
      }])
  })

  it('rejects unauthorized requests (1)', async () => {
    await request(app)
      .post('/auth')
      .send({ email: 'name@acme.com', password: 'password' })
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })

  it('rejects unauthorized requests (2)', async () => {
    await request(app)
      .post('/auth')
      .send({})
      .expect(401, [{
        code: 'UNAUTHORIZED_REQUEST',
        message: 'Unauthorized request.'
      }])
  })
})
