import type { EventTypeValue } from '@/services/events/types'

/**
 * Pre-computed Tailwind class mappings for event type colors.
 * Tailwind purges dynamic class names, so we map every token up-front.
 */

interface ColorClasses {
  dot: string
  dotBorder: string
  bg: string
  border: string
  text: string
  badge: string
  barBg: string
  laneBg: string
}

const COLORS: Record<string, ColorClasses> = {
  pink: {
    dot: 'bg-pink-500',
    dotBorder: 'border-pink-500/50',
    bg: 'bg-pink-500/10',
    border: 'border-pink-500/30',
    text: 'text-pink-300',
    badge: 'bg-pink-500/20 text-pink-400',
    barBg: 'bg-pink-500',
    laneBg: 'bg-pink-500/10',
  },
  red: {
    dot: 'bg-red-500',
    dotBorder: 'border-red-500/50',
    bg: 'bg-red-500/10',
    border: 'border-red-500/30',
    text: 'text-red-300',
    badge: 'bg-red-500/20 text-red-400',
    barBg: 'bg-red-500',
    laneBg: 'bg-red-500/10',
  },
  orange: {
    dot: 'bg-orange-500',
    dotBorder: 'border-orange-500/50',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/30',
    text: 'text-orange-300',
    badge: 'bg-orange-500/20 text-orange-400',
    barBg: 'bg-orange-500',
    laneBg: 'bg-orange-500/10',
  },
  blue: {
    dot: 'bg-blue-500',
    dotBorder: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/30',
    text: 'text-blue-300',
    badge: 'bg-blue-500/20 text-blue-400',
    barBg: 'bg-blue-500',
    laneBg: 'bg-blue-500/10',
  },
  purple: {
    dot: 'bg-purple-500',
    dotBorder: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    badge: 'bg-purple-500/20 text-purple-400',
    barBg: 'bg-purple-500',
    laneBg: 'bg-purple-500/10',
  },
  green: {
    dot: 'bg-green-500',
    dotBorder: 'border-green-500/50',
    bg: 'bg-green-500/10',
    border: 'border-green-500/30',
    text: 'text-green-300',
    badge: 'bg-green-500/20 text-green-400',
    barBg: 'bg-green-500',
    laneBg: 'bg-green-500/10',
  },
  gray: {
    dot: 'bg-gray-500',
    dotBorder: 'border-gray-500/50',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    text: 'text-gray-300',
    badge: 'bg-zinc-700 text-zinc-400',
    barBg: 'bg-gray-500',
    laneBg: 'bg-gray-500/10',
  },
}

const EVENT_TYPE_COLOR_KEY: Record<EventTypeValue, string> = {
  meeting: 'green',
  weekend: 'red',
  serenade: 'blue',
  sendoff: 'orange',
  closing: 'purple',
  secuela: 'pink',
  other: 'gray',
}

export function getEventColor(type: EventTypeValue | null): ColorClasses {
  if (type == null) return COLORS.gray
  return COLORS[EVENT_TYPE_COLOR_KEY[type]] ?? COLORS.gray
}

export function getColorByKey(key: string): ColorClasses {
  return COLORS[key] ?? COLORS.gray
}

export { COLORS }
export type { ColorClasses }
