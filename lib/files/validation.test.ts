import { getFileExtension, isAllowedFileExtension } from './validation'

describe('getFileExtension', () => {
  it('returns the lowercased extension with a leading dot', () => {
    expect(getFileExtension('roster.PDF')).toBe('.pdf')
  })

  it('uses the last dot for multi-dot names', () => {
    expect(getFileExtension('dttd.11.final.pdf')).toBe('.pdf')
  })

  it('returns an empty string when there is no extension', () => {
    expect(getFileExtension('roster')).toBe('')
  })

  it('returns an empty string for dotfiles', () => {
    expect(getFileExtension('.pdf')).toBe('')
  })
})

describe('isAllowedFileExtension', () => {
  it.each([
    'roster.pdf',
    'scan.JPG',
    'photo.jpeg',
    'image.png',
    'anim.gif',
    'pic.webp',
  ])('allows %s', (name) => {
    expect(isAllowedFileExtension(name)).toBe(true)
  })

  it.each(['malware.exe', 'sheet.xlsx', 'notes.txt', 'noextension', '.pdf'])(
    'rejects %s',
    (name) => {
      expect(isAllowedFileExtension(name)).toBe(false)
    }
  )
})
