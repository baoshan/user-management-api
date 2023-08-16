-- !!! DANGER !!! This script DROP & RECREATE the `users` table. !!! 

DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id       UUID DEFAULT gen_random_uuid() NOT NULL PRIMARY KEY,
    name     TEXT NOT NULL,
    email    TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    admin    BOOLEAN NOT NULL DEFAULT FALSE
);
