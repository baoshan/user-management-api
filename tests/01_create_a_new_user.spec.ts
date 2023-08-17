/* --- remote dependencies --- */
import request from 'supertest'
import { assert } from 'chai'

/* --- local dependencies --- */
import app from '../src/app.js'
import { generateRandomNewUser } from './utils.js'
import { checkConflictEmail } from '../src/utils/check_conflict_email.js'
import { createAdminUser } from '../src/utils/create_admin_user.js'

describe('Create a new user', async () => {
  it('succeeds', async () => {
    const newUser = generateRandomNewUser()

    const { body: user1 } = await request(app)
      .post('/users')
      .send(newUser)
      .expect(201)

    assert.equal(user1.name, newUser.name)
    assert.equal(user1.email, newUser.email)
    assert.equal(user1.admin, false)
    assert.isFalse('password' in user1)

    const { body: user2 } = await request(app)
      .post('/auth')
      .send({ email: newUser.email, password: newUser.password })
      .expect(200)

    assert.equal(user2.id, user1.id)
    assert.equal(user2.name, newUser.name)
    assert.equal(user2.email, newUser.email)
    assert.equal(user2.admin, false)
    assert.isFalse('password' in user2)
  })

  it('rejects syntax errors', async () => {
    await request(app)
      .post('/users')
      .set('Content-Type', 'application/json')
      .send('foo')
      .expect(400, [{
        code: 'SYNTAX_ERROR',
        message: 'Syntax error.'
      }])
  })

  it('rejects invalid properties', async () => {
    await request(app)
      .post('/users')
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
    newUser1.email = newUser2.email

    await request(app)
      .post('/users')
      .send(newUser1)
      .expect(201)

    await request(app)
      .post('/users')
      .send(newUser2)
      .expect(422, [{
        code: 'USER_EMAIL_CONFLICT',
        message: 'Email is already taken.'
      }])
  })

  it('creates an adminstrator', async () => {
    const adminUser = generateRandomNewUser()
    await createAdminUser(adminUser)
    await request(app)
      .post('/auth')
      .send({ email: adminUser.email, password: adminUser.password })
      .expect(200)
      .then(({ body: { admin } }) => { assert.isTrue(admin) })
  })

  it('throws uncatched errors', () => {
    try {
      checkConflictEmail('foo')
    } catch (error) {
      assert.equal(error, 'foo')
    }
  })
})
