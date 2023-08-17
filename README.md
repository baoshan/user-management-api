# RESTful API for User Management

![ci](https://github.com/baoshan/user-management-api/actions/workflows/ci.yaml/badge.svg)
[![codecov](https://codecov.io/gh/baoshan/user-management-api/graph/badge.svg?token=R1YJICQ8KU)](https://codecov.io/gh/baoshan/user-management-api)

This Express.js app sets up 8 API endpoints for user management.

- Some endpoints require authentication.
- Some endpoints require authentication as an administrator.

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

## Preparement

Database scheme is defined in the [`scheme.sql`](scheme.sql). Below command
**drops** & recreates the table named `users`.

```
psql postgresql://username:password@server:port/database -f scheme.sql
````

A `.env` file is required to provide the PostgreSQL connection string and the
JWT secret:

```
PG=postgresql://username:password@server:port/database
JWT_SECRET=my_jwt_secret
```

## Test & Start

After `npm install`:

- Use `npm test` to run tests.
- Use `npm start` to start service.

## Create a User

Create a new user by providing name, email, and password.

```
POST /users HTTP/1.1
{
    "name": "John Appleseed",
    "email": "john@appleased.com",
    "password": "password"
}

HTTP/1.1 201 Created
{
  "id": "326b8b5e-e4ac-464a-ab61-38246148e9b0",
  "name": "John Appleseed",
  "email": "john@appleased.com",
  "jwt": "..."
}
```

### Authenticate

Authenticate a user using email and password.

```
POST /auth
{
    "email": "john@appleased.com",
    "password": "password"
}

HTTP/1.1 200 OK
{
  "id": "ba2fab75-5873-4e66-a5d2-b91a5de695f3",
  "name": "John Appleseed",
  "email": "john@appleased.com",
  "admin": false,
  "jwt": "..."
}
```

### Get the Authenticated User

The authenticated user is determined using the `JWT` token in the `Authorization` header.

```
GET /user
Authorization: Bearer ...

200 OK
{
  "id": "ba2fab75-5873-4e66-a5d2-b91a5de695f3",
  "name": "John Appleseed",
  "email": "john@appleased.com",
  "admin": false
}
```

### Get an Existing User

Authentication as an administrator is required.

```
GET /users/ba2fab75-5873-4e66-a5d2-b91a5de695f3
Authorization: Bearer ...

200 OK
{
  "id": "ba2fab75-5873-4e66-a5d2-b91a5de695f3",
  "name": "John Appleseed",
  "email": "john@appleased.com",
  "admin": false
}
```

### Update the Authenticated User

Update one or more properties (name, email, and password) of the authenticated user.

The authenticated user is determined using the `JWT` token in the `Authorization` header.

```
PUT /user
Authorization: Bearer ...

{"name": "Johnny Appleseed"}

HTTP/1.1 204
```

### Update an Existing User

Update one or more properties (name, email, and password) of the authenticated user.

Authentication as an administrator is required.

```
PUT /users/ba2fab75-5873-4e66-a5d2-b91a5de695f3
Authorization: Bearer ...

{"name": "Johnny Appleseed"}

HTTP/1.1 204
```

### Delete the Authenticated User

The authenticated user is determined using the `JWT` token in the `Authorization` header.

- Request

```
DELETE /user
Authorization: Bearer ...
```

- Response

```
204 No Content
```

### Delete an existing user

Authentication as an administrator is required.

- Request

 ```
DELETE /users/ba2fab75-5873-4e66-a5d2-b91a5de695f3 HTTP/1.1
Authorization: Bearer ...
```

- Response

```
204 No Content
```

## Error Handling

Errors found during the processing of your request are returned in an array.

- Request

```
POST /users HTTP/1.1
{
    "name": "",
    "email": "",
    "password": ""
}
```

- Response

```
422 Unprocessable Entity
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

All pre-defined errors (code and message) are detailed in the table below.

|   | Code | Message |
|:--|:--|:--|
| 1 | `SYNTAX_ERROR` | Syntax error. |
| 2 | `UNAUTHORIZED_REQUEST` | Unauthorized request. |
| 3 | `PERMISSION_DENIED` | Permission denied. |
| 4 | `USER_ID_MALFORMED` | User ID should be a UUID. |
| 5 | `USER_NAME_INVALID` | Name should be non-empty. |
| 6 | `USER_EMAIL_INVALID` | A valid email address is required. |
| 7 | `USER_PASSWORD_INVALID` | Password should be between 8 and 32 characters. |
| 8 | `USER_EMAIL_CONFLICT` | Email is already taken. |

Not all errors apply to all endpoints. For example, the `UNAUTHORIZED_REQUEST`
error does not apply when creating a new user. This table lists endpoints and
their applying error numbers.

| Endpoint | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 |
|:---------|:--|:--|:--|:--|:--|:--|:--|:--|
| Create a new user             | ⏺ | - | - | - | ⏺ | ⏺ | ⏺ | ⏺ |
| Authenticate                  | ⏺ | ⏺ | - | - | - | - | - | - |
| Get the authenticated user    | - | ⏺ | - | ⏺ | - | - | - | - |
| Get an existing user          | - | ⏺ | ⏺ | ⏺ | - | - | - | - |
| Update the authenticated user | ⏺ | ⏺ | - | ⏺ | ⏺ | ⏺ | ⏺ | ⏺ |
| Update an existing user       | ⏺ | ⏺ | ⏺ | ⏺ | ⏺ | ⏺ | ⏺ | ⏺ |
| Delete the authenticated user | - | ⏺ | - | ⏺ | - | - | - | - |
| Delete an existing user       | - | ⏺ | ⏺ | ⏺ | - | - | - | - |
