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

/**
 * Creates a successful Result containing data.
 * @example
 * const result = ok({ id: 1, name: 'John' })
 * // result.data = { id: 1, name: 'John' }
 */
export const ok = <D>(data: D): DataResult<D> => ({ data })

/**
 * Creates an error Result containing an error value.
 * @example
 * const result = err('User not found')
 * // result.error = 'User not found'
 */
export const err = <E>(error: E): ErrorResult<E> => ({ error })

/**
 * Type guard that checks if a Result is successful.
 * Prefer `Results.unwrapOr()` or `Results.match()` over manual `isOk` checks.
 * @example
 * const result = await getUser(id)
 * if (isOk(result)) {
 *   console.log(result.data.name) // TypeScript knows data exists
 * }
 */
export const isOk = <E, D>(result: Result<E, D>): result is DataResult<D> => {
  return 'data' in result && !('error' in result)
}

/**
 * Type guard that checks if a Result is an error.
 * Prefer `Results.match()` for handling both cases.
 * @example
 * const result = await getUser(id)
 * if (isErr(result)) {
 *   console.error(result.error) // TypeScript knows error exists
 * }
 */
export const isErr = <E, D>(result: Result<E, D>): result is ErrorResult<E> => {
  return 'error' in result && !('data' in result)
}

/**
 * Extracts the data from a successful Result, or throws if it's an error.
 * Use only when you're certain the Result is successful, or in tests.
 * Prefer `Results.unwrapOr()` or `Results.match()` for safer handling.
 * @example
 * const result = await getUser(id)
 * const user = unwrap(result) // throws if error
 */
export const unwrap = <E, D>(result: Result<E, D>): D => {
  if (isOk(result)) {
    return result.data
  }
  throw new Error(`Attempted to unwrap error result: ${result.error}`)
}

/**
 * Extracts the error from a failed Result, or throws if it's successful.
 * Useful in tests to verify error conditions.
 * @example
 * const result = await createUser({ email: 'invalid' })
 * const error = unwrapErr(result) // throws if success
 * expect(error).toBe('Invalid email format')
 */
export const unwrapErr = <E, D>(result: Result<E, D>): E => {
  if (isErr(result)) {
    return result.error
  }
  throw new Error(`Attempted to unwrap success result: ${result.data}`)
}

/**
 * Transforms the data inside a successful Result, leaving errors unchanged.
 * Use for transforming data without unwrapping.
 * @example
 * const userResult = await getUser(id)
 * const nameResult = map(userResult, user => user.name)
 * // If userResult was ok({ name: 'John' }), nameResult is ok('John')
 * // If userResult was err('Not found'), nameResult is err('Not found')
 *
 * @example
 * // Transform API response to display format
 * const displayResult = Results.map(candidateResult, candidate => ({
 *   label: `${candidate.firstName} ${candidate.lastName}`,
 *   value: candidate.id
 * }))
 */
export const map = <E, D, U>(
  result: Result<E, D>,
  fn: (data: D) => U
): Result<E, U> => {
  if (isOk(result)) {
    return ok(fn(result.data))
  }
  return result as Result<E, U>
}

/**
 * Transforms the error inside a failed Result, leaving success unchanged.
 * Use for converting error types or adding context to errors.
 * @example
 * const result = await getUser(id)
 * const friendlyResult = mapErr(result, error => `Failed to load user: ${error}`)
 */
export const mapErr = <E, D, F>(
  result: Result<E, D>,
  fn: (error: E) => F
): Result<F, D> => {
  if (isErr(result)) {
    return err(fn(result.error))
  }
  return result as Result<F, D>
}

/**
 * Chains operations that return Results. If the first Result is an error,
 * the chain short-circuits and returns that error.
 * Use for sequential operations where each depends on the previous.
 * @example
 * // Fetch user, then fetch their posts
 * const postsResult = andThen(
 *   await getUser(id),
 *   user => getPosts(user.id)
 * )
 *
 * @example
 * // Validate input, then save to database
 * const saveResult = Results.andThen(
 *   Results.safeParse(input, CandidateSchema),
 *   validatedData => saveCandidate(validatedData)
 * )
 */
export const andThen = <E, D, U>(
  result: Result<E, D>,
  fn: (data: D) => Result<E, U>
): Result<E, U> => {
  if (isOk(result)) {
    return fn(result.data)
  }
  return result as Result<E, U>
}

/**
 * Extracts the data from a Result, returning a default value if it's an error.
 * Preferred over `isOk(result) ? result.data : defaultValue` pattern.
 * @example
 * const users = Results.unwrapOr(await getUsers(), [])
 *
 * @example
 * // Combine multiple results with fallbacks
 * const combinedRoster = [
 *   ...Results.unwrapOr(mensRosterResult, []),
 *   ...Results.unwrapOr(womensRosterResult, []),
 * ]
 */
export const unwrapOr = <E, D>(result: Result<E, D>, defaultValue: D): D => {
  if (isOk(result)) {
    return result.data
  }
  return defaultValue
}

/**
 * Pattern matches on a Result, handling both success and error cases.
 * Returns a value of the same type from both branches.
 * Preferred for rendering or when you need to handle both cases explicitly.
 * @example
 * // Render based on result
 * const content = Results.match(
 *   userResult,
 *   user => <UserProfile user={user} />,
 *   error => <ErrorMessage message={error} />
 * )
 *
 * @example
 * // Convert to API response
 * return Results.match(
 *   saveResult,
 *   data => NextResponse.json(data),
 *   error => NextResponse.json({ error }, { status: 400 })
 * )
 */
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

/**
 * Converts a nullable value to a Result.
 * Returns ok(value) if value exists, or err(error) if null/undefined.
 * @example
 * const user = users.find(u => u.id === id)
 * const result = Results.fromNullable(user, 'User not found')
 *
 * @example
 * // Convert optional query param
 * const weekendId = Results.fromNullable(
 *   searchParams.get('weekendId'),
 *   'Weekend ID is required'
 * )
 */
export const fromNullable = <E, D>(
  value: D | null | undefined,
  error: E
): Result<E, D> => {
  if (isNil(value)) {
    return err(error)
  }
  return ok(value)
}

/**
 * Converts a Result to a nullable value.
 * Returns the data if successful, or null if an error.
 * Useful for interop with APIs that expect nullable values.
 * @example
 * const user = Results.toNullable(await getUser(id))
 * if (user) {
 *   // use user
 * }
 */
export const toNullable = <E, D>(result: Result<E, D>): D | null => {
  if (isErr(result)) {
    return null
  }
  return result.data
}

/**
 * Converts a Supabase PostgrestSingleResponse to a Result.
 * Extracts the error message if the response failed.
 * @example
 * const response = await supabase.from('users').select().single()
 * const result = Results.fromSupabase(response)
 * // Now use Results.map, Results.match, etc.
 */
export const fromSupabase = <D>(
  supabaseResponse: PostgrestSingleResponse<D>
): Result<string, D> => {
  if (supabaseResponse.error) {
    return err(supabaseResponse.error.message)
  }

  return ok(supabaseResponse.data)
}

/**
 * Parses a value with a Zod schema, returning a Result.
 * Returns ok(parsedData) if valid, or err(message) if validation fails.
 * @example
 * const result = Results.safeParse(formData, CandidateSchema)
 * if (isOk(result)) {
 *   await saveCandidate(result.data) // data is typed correctly
 * }
 *
 * @example
 * // Chain with andThen for validate-then-save pattern
 * const saveResult = Results.andThen(
 *   Results.safeParse(input, UpdateUserSchema),
 *   validData => updateUser(validData)
 * )
 */
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

/**
 * Logs errors from multiple Results. Useful for debugging parallel operations.
 * @example
 * const [result1, result2, result3] = await Promise.all([op1(), op2(), op3()])
 * Results.logFailures(result1, result2, result3)
 */
export const logFailures = (...results: Array<Result<unknown, unknown>>) => {
  if (Array.isArray(results)) {
    results.forEach((r) => logger.error(r.error))
  }
  logger.error(results)
}

/**
 * Result utilities for functional error handling.
 *
 * Common patterns:
 * - `Results.unwrapOr(result, default)` - Get data or fallback to default
 * - `Results.match(result, onOk, onErr)` - Handle both cases explicitly
 * - `Results.map(result, fn)` - Transform data without unwrapping
 * - `Results.andThen(result, fn)` - Chain operations that return Results
 * - `Results.fromSupabase(response)` - Convert Supabase responses
 * - `Results.safeParse(value, schema)` - Validate with Zod
 *
 * @example
 * // Prefer this:
 * const users = Results.unwrapOr(await getUsers(), [])
 *
 * // Over this:
 * const result = await getUsers()
 * const users = isOk(result) ? result.data : []
 */
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
