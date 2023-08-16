import postgres from 'postgres'
import './env.js'

export const sql = postgres(process.env.PG!)
export const PostgresError = postgres.PostgresError
