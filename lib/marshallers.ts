/**
 * Generic marshaller interface — defines how to convert a typed value
 * to and from a string representation.
 * available for any string-based serialization (localStorage, cookies, etc.).
 *
 * - marshal:   T → string | null  (null means "no value" / "use default")
 * - unmarshal: string | null → T  (null means "absent in source")
 */
export interface Marshaller<T> {
  /** Serialize a value into a string (or null, if equal to defaultValue) */
  marshal: (value: T) => string | null
  /** Deserialize a value from a string (or default value, if doesn't exist) */
  unmarshal: (raw: string | null) => T
}

// ---------------------------------------------------------------------------
// String
// ---------------------------------------------------------------------------

/** Marshals a string. Returns null when equal to `defaultValue`. */
export function stringMarshaller(
  defaultValue: string = ''
): Marshaller<string> {
  return {
    marshal: (value) => (value === defaultValue ? null : value),
    unmarshal: (raw) => raw ?? defaultValue,
  }
}

// ---------------------------------------------------------------------------
// Integer
// ---------------------------------------------------------------------------

/** Marshals an integer via parseInt/String. Returns null when equal to `defaultValue`. */
export function intMarshaller(defaultValue: number): Marshaller<number> {
  return {
    marshal: (value) => (value === defaultValue ? null : String(value)),
    unmarshal: (raw) => (raw !== null ? parseInt(raw, 10) : defaultValue),
  }
}

// ---------------------------------------------------------------------------
// Boolean
// ---------------------------------------------------------------------------

interface BooleanMarshallerOptions {
  /** String representation of true. Default: 'true'. */
  trueValue?: string
  /** String representation of false. Default: 'false'. */
  falseValue?: string
  /** When the value matches this, marshal returns null (omit from URL). */
  defaultValue?: boolean
}

/** Marshals a boolean to/from custom string values (e.g. 'desc'/'asc'). */
export function booleanMarshaller(
  options: BooleanMarshallerOptions = {}
): Marshaller<boolean> {
  const { trueValue = 'true', falseValue = 'false', defaultValue } = options
  return {
    marshal: (value) => {
      if (value === defaultValue) return null
      return value ? trueValue : falseValue
    },
    unmarshal: (raw) => {
      if (raw === trueValue) return true
      if (raw === falseValue) return false
      return defaultValue ?? false
    },
  }
}

// ---------------------------------------------------------------------------
// Array (comma-separated by default)
// ---------------------------------------------------------------------------

interface ArrayMarshallerOptions {
  /** Delimiter between items. Default: ','. */
  separator?: string
}

/** Marshals a string array to/from a delimited string. Empty array → null. */
export function arrayMarshaller(
  options: ArrayMarshallerOptions = {}
): Marshaller<string[]> {
  const { separator = ',' } = options
  return {
    marshal: (value) => (value.length > 0 ? value.join(separator) : null),
    unmarshal: (raw) => (raw ? raw.split(separator) : []),
  }
}

// ---------------------------------------------------------------------------
// Page (1-indexed URL ↔ 0-indexed value)
// ---------------------------------------------------------------------------

/** Marshals a 0-indexed page number to a 1-indexed URL string. Page 0 → null. */
export function pageMarshaller(): Marshaller<number> {
  return {
    marshal: (value) => (value > 0 ? String(value + 1) : null),
    unmarshal: (raw) => (raw !== null ? Math.max(0, parseInt(raw, 10) - 1) : 0),
  }
}

// ---------------------------------------------------------------------------
// JSON (for objects / complex types)
// ---------------------------------------------------------------------------

/** Marshals any JSON-serializable value. Returns `defaultValue` on parse failure. */
export function jsonMarshaller<T>(defaultValue: T): Marshaller<T> {
  return {
    marshal: (value) => {
      try {
        return JSON.stringify(value)
      } catch {
        return null
      }
    },
    unmarshal: (raw) => {
      if (raw === null) return defaultValue
      try {
        return JSON.parse(raw) as T
      } catch {
        return defaultValue
      }
    },
  }
}
