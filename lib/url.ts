const INCLUDES_FORWARD_SLASH_AT_START_REGEX = /^\/(.|\n)*$/
const INCLUDES_FORWARD_SLASH_AT_START = (string: string) =>
  INCLUDES_FORWARD_SLASH_AT_START_REGEX.test(string)

export function getUrl(path: string) {
  return `${process.env.SITE_URL}${!INCLUDES_FORWARD_SLASH_AT_START(path) ? '/' : ''}${path}`
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/ /g, '-')
    .replace(/[^\w-]+/g, '')
}

/**
 * An opinionated approach to reversing a slug into a Title
 */
export function unslugify(text: string) {
  return text
    .split('-')
    .map((word) => {
      if (word.length === 0) {
        return ''
      }
      return word.charAt(0).toUpperCase() + word.slice(1)
    })
    .join(' ')
}
