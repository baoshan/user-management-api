-- !!! DANGER !!! This script DROPS & RECREATES the `users` table. !!! 

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id       UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name     TEXT NOT NULL,
    email    TEXT NOT NULL,
    password TEXT NOT NULL,
    admin    BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX users_email_key 
   ON users (lower(email));
