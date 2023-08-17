/* --- external dependencies --- */
import express from 'express'
import 'express-async-errors'
import { expressjwt, type Request as JWTRequest } from 'express-jwt'
import { isLeft } from 'fp-ts/lib/Either.js'

/* --- local dependencies --- */
import { createUser } from './actions/create_user.js'
import { auth } from './actions/auth.js'
import { retrieveUser } from './actions/retrieve_user.js'
import { updateUser } from './actions/update_user.js'
import { deleteUser } from './actions/delete_user.js'
import {
  permissionDeniedError,
  syntaxError,
  unauthorizedRequestError
} from './utils/non_parsing_errors.js'

const app = express()

const jwt = expressjwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ['HS256']
})

const json = express.json()

// create a new user
app.post('/users', json, async (req, res) => {
  const result = await createUser(req.body)
  if (isLeft(result)) return res.status(422).send(result.left)
  res.status(201).json(result.right)
})

// authenticate
app.post('/auth', json, async (req, res) => {
  const user = await auth(req.body.email, req.body.password)
  if (user == null) return res.status(401).json([unauthorizedRequestError])
  res.json(user)
})

// get the authenticted user
app.get('/user', jwt, async (req: JWTRequest, res) => {
  const id = req.auth?.sub
  // if (!id) return res.status(401).json([unauthorizedRequestError]);
  const result = await retrieveUser(id)
  if (isLeft(result)) return res.status(422).send(result.left)
  const user = result.right
  if (user == null) return res.status(404).end()
  res.status(200).json(user)
})

// get an existing user
app.get('/users/:id', jwt, async function (req: JWTRequest, res) {
  if (!req.auth?.admin) return res.status(403).json([permissionDeniedError])
  const id = req.params.id
  const result = await retrieveUser(id)
  if (isLeft(result)) return res.status(422).send(result.left)
  const user = result.right
  if (user == null) return res.status(404).end()
  res.status(200).json(user)
})

// update the authenticated user
app.put('/user', json, jwt, async function (req: JWTRequest, res) {
  const id = req.auth?.sub
  const result = await updateUser(id, req.body)
  if (isLeft(result)) {
    res.status(422).json(result.left)
  } else {
    res.status(204).end()
  }
})

// update an existing user
app.put('/users/:id', json, jwt, async function (req: JWTRequest, res) {
  if (!req.auth?.admin) return res.status(403).json([permissionDeniedError])
  const result = await updateUser(req.params.id, req.body)
  if (isLeft(result)) {
    res.status(422).json(result.left)
  } else {
    res.status(204).end()
  }
})

// Delete the authenticated user
app.delete('/user', jwt, async (req: JWTRequest, res) => {
  const id = req.auth?.sub
  const result = await deleteUser(id)
  if (isLeft(result)) {
    res.status(422).json(result.left)
  } else {
    res.status(204).end()
  }
})

// Delete an existing user
app.delete('/users/:id', jwt, async function (req: JWTRequest, res) {
  if (!req.auth?.admin) return res.status(403).json([permissionDeniedError])
  const result = await deleteUser(req.params.id)
  if (isLeft(result)) {
    res.status(422).json(result.left)
  } else {
    res.status(204).end()
  }
})

// Sends unified responses for errors raised by body or jwt parsing.
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): undefined => {
    if (err.name === 'UnauthorizedError') {
      res.status(401).json([unauthorizedRequestError])
    } else if (err.name === 'SyntaxError') {
      res.status(400).json([syntaxError])
    } else next(err)
  }
)

export default app // for testing
