const SAMPLE_ACTIVITY = [
  {
    text: 'Candidate fee recorded — $195 by card',
    when: 'Aug 25',
  },
  {
    text: 'A fee waived — scholarship',
    when: 'Aug 15',
  },
  {
    text: 'Directions to camp updated — in Files',
    when: 'Aug 12',
  },
]

function SampleBadge() {
  return (
    <span className="rounded-full bg-muted px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
      sample — not built yet
    </span>
  )
}

/**
 * Brainstorming widgets the board could ask for next. Everything below renders
 * sample data only and is labeled as such — nothing here reads live data.
 */
export function IdeasSection() {
  return (
    <section className="rounded-lg border border-dashed p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Ideas
        </h2>
        <SampleBadge />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Things this dashboard could show next — tell the developers which ones
        would help.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium">Recent admin activity</h3>
            <SampleBadge />
          </div>
          <ul className="mt-3 space-y-2">
            {SAMPLE_ACTIVITY.map((row) => (
              <li
                key={row.text}
                className="flex items-baseline justify-between gap-3"
              >
                <span className="flex min-w-0 items-baseline gap-2 text-sm text-muted-foreground">
                  <span
                    className="h-1.5 w-1.5 shrink-0 translate-y-[-1px] rounded-full bg-border"
                    aria-hidden
                  />
                  <span className="truncate">{row.text}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                  {row.when}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-medium">File storage used</h3>
            <SampleBadge />
          </div>
          <p className="mt-3 font-serif text-xl font-semibold tabular-nums">
            8.2 <span className="text-sm font-normal">of 10 GB</span>
          </p>
          <div className="mt-2 h-1.5 w-full rounded-full bg-border">
            <div
              className="h-1.5 w-[82%] rounded-full bg-primary"
              aria-hidden
            />
          </div>
        </div>
      </div>
    </section>
  )
}
