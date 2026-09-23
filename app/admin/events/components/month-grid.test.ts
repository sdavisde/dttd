import { buildMonthCells, DAY_EVENT_LIMIT, splitDayEvents } from './month-grid'

describe('buildMonthCells labels', () => {
  // September 2025 starts on a Monday, so one day is borrowed from August
  // and four from October — the month the board draws.
  const { cells } = buildMonthCells(2025, 8)

  it('names the month on the first borrowed day at the start', () => {
    expect(cells[0]).toMatchObject({
      day: 31,
      inMonth: false,
      label: 'Aug 31',
    })
  })

  it('prints bare numbers for days inside the month', () => {
    expect(cells[1]).toMatchObject({ day: 1, inMonth: true, label: '1' })
    expect(cells[30]).toMatchObject({ day: 30, inMonth: true, label: '30' })
  })

  it('names the month on the first borrowed day at the end, then stops', () => {
    expect(cells[31]).toMatchObject({
      day: 1,
      inMonth: false,
      label: 'Oct 1',
    })
    expect(cells[32]).toMatchObject({ day: 2, inMonth: false, label: '2' })
    expect(cells[34]).toMatchObject({ day: 4, inMonth: false, label: '4' })
  })

  it('rolls the borrowed month over a year boundary', () => {
    // January 2027 starts on a Friday: the leading days come from Dec 2026.
    const january = buildMonthCells(2027, 0).cells
    expect(january[0].label).toBe('Dec 27')
    // December 2026 ends on a Thursday: the trailing days run into Jan 2027.
    const december = buildMonthCells(2026, 11).cells
    expect(december[december.length - 2].label).toBe('Jan 1')
  })
})

describe('splitDayEvents', () => {
  const days = (n: number) => Array.from({ length: n }, (_, i) => i)

  it('shows everything while the day is at or under the limit', () => {
    expect(splitDayEvents(days(DAY_EVENT_LIMIT), false)).toEqual({
      visible: days(DAY_EVENT_LIMIT),
      hiddenCount: 0,
    })
  })

  it('keeps a line free for the overflow affordance past the limit', () => {
    expect(splitDayEvents(days(5), false)).toEqual({
      visible: [0, 1],
      hiddenCount: 3,
    })
  })

  it('hides nothing once the cell is expanded', () => {
    expect(splitDayEvents(days(5), true)).toEqual({
      visible: days(5),
      hiddenCount: 0,
    })
  })

  it('handles an empty day', () => {
    expect(splitDayEvents([], false)).toEqual({ visible: [], hiddenCount: 0 })
  })
})
