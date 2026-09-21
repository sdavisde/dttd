import type { FileObject } from '@supabase/storage-js'
import { isErr, isOk } from '@/lib/results'
import {
  adminFilesHref,
  describeFolderContents,
  findFolderBySlug,
  toBrowserEntries,
  validateFolderName,
} from './browser'

const folder = (name: string) =>
  ({
    name,
    id: null,
    metadata: null,
    updated_at: null,
  }) as unknown as FileObject

const file = (name: string, size = 1024) =>
  ({
    name,
    id: name,
    metadata: { size },
    updated_at: '2026-06-14T00:00:00Z',
  }) as unknown as FileObject

describe('findFolderBySlug', () => {
  it('matches a folder whose real name does not survive unslugify', () => {
    const items = [folder('team handbooks'), file('team-handbooks')]
    expect(findFolderBySlug(items, 'team-handbooks')?.name).toBe(
      'team handbooks'
    )
  })

  it('never matches a file', () => {
    expect(findFolderBySlug([file('archive')], 'archive')).toBeUndefined()
  })
})

describe('toBrowserEntries', () => {
  const entries = toBrowserEntries(
    [
      file('b.pdf'),
      folder('Past Editions'),
      file('.placeholder'),
      file('a.pdf'),
    ],
    'Team Handbooks',
    ['team-handbooks']
  )

  it('drops placeholders and lists folders before files', () => {
    expect(entries.map((entry) => entry.name)).toEqual([
      'Past Editions',
      'a.pdf',
      'b.pdf',
    ])
  })

  it('marks folders and builds nested paths', () => {
    expect(entries[0]).toMatchObject({
      kind: 'folder',
      storagePath: 'Team Handbooks/Past Editions',
      slugs: ['team-handbooks', 'past-editions'],
      size: null,
    })
    expect(entries[1]).toMatchObject({
      kind: 'file',
      storagePath: 'Team Handbooks/a.pdf',
      size: 1024,
    })
  })

  it('describes the contents', () => {
    expect(describeFolderContents(entries, 'Team Handbooks')).toBe(
      '1 folder and 2 files in Team Handbooks'
    )
  })
})

describe('adminFilesHref', () => {
  it('builds root and nested links', () => {
    expect(adminFilesHref([])).toBe('/admin/files')
    expect(adminFilesHref(['a', 'b'])).toBe('/admin/files/a/b')
  })
})

describe('validateFolderName', () => {
  it('trims valid names', () => {
    const result = validateFolderName('  2025 Editions ')
    expect(isOk(result) && result.data).toBe('2025 Editions')
  })

  it('rejects empty names and path characters', () => {
    expect(isErr(validateFolderName('   '))).toBe(true)
    expect(isErr(validateFolderName('a/b'))).toBe(true)
  })
})
