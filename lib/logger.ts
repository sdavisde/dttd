import pino from 'pino'

const levelEmojis: Record<number, string> = {
  10: '🔍', // trace
  20: '🐛', // debug
  30: 'ℹ️', // info
  40: '⚠️', // warn
  50: '💢', // error
  60: '💀', // fatal
}

function formatLog(log: Record<string, unknown>) {
  const emoji = levelEmojis[log.level as number] ?? '📝'
  const { level, time, pid, hostname, msg, ...rest } = log
  void level
  void time
  void pid
  void hostname // suppress unused warnings
  const hasExtra = Object.keys(rest).length > 0
  return hasExtra
    ? `${emoji} ${msg ?? ''} ${JSON.stringify(rest)}`
    : `${emoji} ${msg ?? ''}`
}

const stream = {
  write: (str: string) => {
    try {
      const log = JSON.parse(str)
      console.log(formatLog(log))
    } catch {
      process.stdout.write(str)
    }
  },
}

export const logger = pino(
  {
    browser: {
      write: (o) => console.log(formatLog(o as Record<string, unknown>)),
    },
  },
  stream
)
