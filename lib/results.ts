import { PostgrestSingleResponse } from '@supabase/supabase-js'
import { isNil } from 'lodash'
import z from 'zod'
import { logger } from './logger'

export type ErrorResult<E> = {
  error: E
  data?: never
}

export type DataResult<D> = {
  error?: never
  data: D
}

export type Result<E, D> = NonNullable<ErrorResult<E> | DataResult<D>>

// Helper functions to create results
export const ok = <D>(data: D): DataResult<D> => ({ data })
export const err = <E>(error: E): ErrorResult<E> => ({ error })

// Helper functions to check result type
export const isOk = <E, D>(result: Result<E, D>): result is DataResult<D> => {
  return 'data' in result && !('error' in result)
}

export const isErr = <E, D>(result: Result<E, D>): result is ErrorResult<E> => {
  return 'error' in result && !('data' in result)
}

// Helper function to extract data (throws if error)
export const unwrap = <E, D>(result: Result<E, D>): D => {
  if (isOk(result)) {
    return result.data
  }
  throw new Error(`Attempted to unwrap error result: ${result.error}`)
}

// Helper function to extract error (throws if success)
export const unwrapErr = <E, D>(result: Result<E, D>): E => {
  if (isErr(result)) {
    return result.error
  }
  throw new Error(`Attempted to unwrap success result: ${result.data}`)
}

// Helper function to map over success value
export const map = <E, D, U>(
  result: Result<E, D>,
  fn: (data: D) => U
): Result<E, U> => {
  if (isOk(result)) {
    return ok(fn(result.data))
  }
  return result as Result<E, U>
}

// Helper function to map over error value
export const mapErr = <E, D, F>(
  result: Result<E, D>,
  fn: (error: E) => F
): Result<F, D> => {
  if (isErr(result)) {
    return err(fn(result.error))
  }
  return result as Result<F, D>
}

// Helper function to chain operations
export const andThen = <E, D, U>(
  result: Result<E, D>,
  fn: (data: D) => Result<E, U>
): Result<E, U> => {
  if (isOk(result)) {
    return fn(result.data)
  }
  return result as Result<E, U>
}

// Helper function to provide default value on error
export const unwrapOr = <E, D>(result: Result<E, D>, defaultValue: D): D => {
  if (isOk(result)) {
    return result.data
  }
  return defaultValue
}

// Helper function to match on result (like pattern matching)
export const match = <E, D, U>(
  result: Result<E, D>,
  onOk: (data: D) => U,
  onErr: (error: E) => U
): U => {
  if (isOk(result)) {
    return onOk(result.data)
  }
  return onErr(result.error)
}

export const fromNullable = <E, D>(
  value: D | null | undefined,
  error: E
): Result<E, D> => {
  if (isNil(value)) {
    return err(error)
  }
  return ok(value)
}

export const toNullable = <E, D>(result: Result<E, D>): D | null => {
  if (isErr(result)) {
    return null
  }
  return result.data
}

export const fromSupabase = <D>(
  supabaseResponse: PostgrestSingleResponse<D>
): Result<string, D> => {
  if (supabaseResponse.error) {
    return err(supabaseResponse.error.message)
  }

  return ok(supabaseResponse.data)
}

export const safeParse = <T>(
  value: unknown,
  schema: z.ZodSchema<T>
): Result<string, T> => {
  const result = schema.safeParse(value)
  if (!result.success) {
    return err(result.error.message)
  }
  return ok(result.data)
}

export const logFailures = (...results: Array<Result<unknown, unknown>>) => {
  if (Array.isArray(results)) {
    results.forEach((r) => logger.error(r.error))
  }
  logger.error(results)
}

export const Results = {
  err,
  ok,
  isErr,
  isOk,
  map,
  mapErr,
  andThen,
  unwrap,
  unwrapErr,
  unwrapOr,
  match,
  fromNullable,
  toNullable,
  fromSupabase,
  safeParse,
  logFailures,
} as const
