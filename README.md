# RESTful API for User Management

![ci](https://github.com/baoshan/user-management-api/actions/workflows/ci.yml/badge.svg)
[![codecov](https://codecov.io/gh/baoshan/user-management-api/graph/badge.svg?token=R1YJICQ8KU)](https://codecov.io/gh/baoshan/user-management-api)

This Express.js app sets up 8 API endpoints for user management:

| # | Method | Route | Purpose | Auth? | Admin? |
|:--|:--|:--|:--|:--|:--|
| 1 | `POST` | `/users` | Create a new user | No | No |
| 2 | `POST` | `/auth` | Authenticate | No | No |
| 3 | `GET` | `/user` | Get the authenticated user | Yes | No |
| 4 | `GET` | `/users/:id` | Get an existing user | Yes | Yes |
| 5 | `PUT` | `/user` | Update the authenticated user | Yes | No |
| 6 | `PUT` | `/users/:id` | Update an existing user | Yes | Yes |
| 7 | `DELETE` | `/user` | Delete the authenticated user | Yes | No |
| 8 | `DELETE` | `/users/:id` | Delete an existing user | Yes | Yes |

## Environment Prepare

Database scheme is defined in the [`scheme.sql`](scheme.sql). Below command
**drops** & recreates the table named `users`.

```
psql postgresql://username:password@server:port/database -f scheme.sql
````

A `.env` file is required to provide the PostgreSQL connection string and the
JWT secret:

```
PG=postgresql://username:password@server:port/database
JWT_SECRET=my_jet_secret
```

## Run Tests

After `npm install`, use `npm test` to run tests.

### Create A User

- Successful request

```
POST http://localhost:3000/users HTTP/1.1
Content-Type: application/json

{
    "name": "John Appleased",
    "email": "john@appleased.com",
    "password": "password"
}

HTTP/1.1 201 Created
{
  "id": "326b8b5e-e4ac-464a-ab61-38246148e9b0",
  "name": "John Appleased",
  "email": "john@appleased.com",
  "jwt": "..."
}
```

The API responds with a non-empty array of errors for invalid requests.

- Invalid name, email, and password
```
POST http://localhost:3000/users HTTP/1.1
{
    "name": "",
    "email": "john",
    "password": "pwd"
}

HTTP/1.1 422 Unprocessable Entity
[
  {
    "code": "USER_NAME_INVALID",
    "message": "Name should be non-empty."
  },
  {
    "code": "USER_EMAIL_INVALID",
    "message": "A valid email address is required."
  },
  {
    "code": "USER_PASSWORD_INVALID",
    "message": "Password should be between 8 and 32 characters."
  }
]
```

- Conflict email
```
POST http://localhost:3000/users HTTP/1.1
{
    "name": "Mike Appleased",
    "email": "john@appleased.com",
    "password": "password"
}

HTTP/1.1 422 Unprocessable Entity
[
  {
    "code": "USER_EMAIL_CONFLICT",
    "message": "Email is already taken."
  }
]
```

## Error Handling

| # | Name |
|:--|:--|
| 1 | `SYNTAX_ERROR` |
| 2 | `UNAUTHORIZED_REQUEST` |
| 3 | `PERMISSION_DENIED` |
| 4 | `USER_ID_MALFORMED` |
| 5 | `USER_NAME_INVALID` |
| 6 | `USER_EMAIL_INVALID` |
| 7 | `USER_PASSWORD_INVALID` |
| 8 | `USER_EMAIL_CONFLICT` |

| # | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|:--|:--|:--|:--|:--|:--|:--|:--|:--|
| Create a new user             | Y | N | N | N | Y | Y | Y | Y |
| Authenticate                  | Y | Y | N | N | N | N | N | N |
| Get the authenticated user    | N | Y | N | Y | N | N | N | N |
| Get an existing user          | N | Y | Y | Y | N | N | N | N |
| Update the authenticated user | Y | Y | N | Y | Y | Y | Y | Y |
| Update an existing user       | Y | Y | Y | Y | Y | Y | Y | Y |
| Delete the authenticated user | N | Y | N | Y | N | N | N | N |
| Delete an existing user       | N | Y | Y | Y | N | N | N | N |
