import type { MeetingMinuteFile } from '@/lib/files/types'
import {
  formatMinutesDate,
  formatMinutesMeta,
  MEETING_MINUTES_FILES_HREF,
} from './minutes-summary'

const NOW = new Date('2025-09-23T12:00:00Z')

type MinuteFileOverrides = Omit<Partial<MeetingMinuteFile>, 'metadata'> & {
  metadata?: Partial<NonNullable<MeetingMinuteFile['metadata']>>
}

function minuteFile(overrides: MinuteFileOverrides): MeetingMinuteFile {
  return {
    id: 'file-1',
    name: 'Board minutes - August 2025.pdf',
    bucket_id: 'files',
    owner: '',
    created_at: '2025-08-20T15:00:00Z',
    updated_at: '2025-08-20T15:00:00Z',
    last_accessed_at: '2025-08-20T15:00:00Z',
    metadata: {},
    ...overrides,
  } as MeetingMinuteFile
}

describe('formatMinutesDate', () => {
  it('drops the year for a file uploaded this year', () => {
    expect(formatMinutesDate('2025-08-20T15:00:00Z', NOW)).toBe('Aug 20')
  })

  it('keeps the year for an older file', () => {
    expect(formatMinutesDate('2024-05-21T15:00:00Z', NOW)).toBe('May 21, 2024')
  })

  it('returns null when the timestamp is missing or unparseable', () => {
    expect(formatMinutesDate(null, NOW)).toBeNull()
    expect(formatMinutesDate('', NOW)).toBeNull()
    expect(formatMinutesDate('not a date', NOW)).toBeNull()
  })
})

describe('formatMinutesMeta', () => {
  it('joins date and size', () => {
    const meta = formatMinutesMeta(
      minuteFile({ metadata: { size: 184320 } }),
      NOW
    )
    expect(meta).toBe('Aug 20 · 180.0 KB')
  })

  it('omits the size when storage reports none', () => {
    expect(formatMinutesMeta(minuteFile({ metadata: {} }), NOW)).toBe('Aug 20')
  })

  it('appends the location when one was captured', () => {
    const meta = formatMinutesMeta(
      minuteFile({ metadata: { size: 512 }, location: 'Fellowship Hall' }),
      NOW
    )
    expect(meta).toBe('Aug 20 · 512 B · Fellowship Hall')
  })

  it('returns an empty string when nothing is known', () => {
    expect(
      formatMinutesMeta(minuteFile({ created_at: '', metadata: {} }), NOW)
    ).toBe('')
  })
})

describe('MEETING_MINUTES_FILES_HREF', () => {
  it('points at the minutes folder in the Files browser', () => {
    expect(MEETING_MINUTES_FILES_HREF).toBe('/admin/files/meeting-minutes')
  })
})
