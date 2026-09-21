import type { FileObject } from '@supabase/storage-js'
import { isErr, isOk } from '@/lib/results'
import {
  adminFilesHref,
  describeAllFiles,
  describeFolderContents,
  findFolderBySlug,
  folderPathSlugs,
  toAllFilesEntries,
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

const file = (name: string, size = 1024, updatedAt = '2026-06-14T00:00:00Z') =>
  ({
    name,
    id: name,
    metadata: { size },
    updated_at: updatedAt,
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

describe('folderPathSlugs', () => {
  it('slugs every segment of a nested path', () => {
    expect(folderPathSlugs('')).toEqual([])
    expect(folderPathSlugs('Team Handbooks/2025 Editions')).toEqual([
      'team-handbooks',
      '2025-editions',
    ])
  })
})

describe('toAllFilesEntries', () => {
  const entries = toAllFilesEntries([
    { folderPath: '', item: file('loose.pdf', 10, '2026-01-01T00:00:00Z') },
    {
      folderPath: 'Team Handbooks',
      item: file('old.pdf', 20, '2026-02-01T00:00:00Z'),
    },
    { folderPath: 'Team Handbooks', item: file('.placeholder', 0) },
    { folderPath: 'Team Handbooks', item: folder('Past Editions') },
    {
      folderPath: 'Team Handbooks/Past Editions',
      item: file('new.pdf', 30, '2026-05-01T00:00:00Z'),
    },
  ])

  it('drops placeholders and folder rows', () => {
    expect(entries.map((entry) => entry.name)).toEqual([
      'new.pdf',
      'old.pdf',
      'loose.pdf',
    ])
    expect(entries.every((entry) => entry.kind === 'file')).toBe(true)
  })

  it('keeps the full nested storage path and links the folder', () => {
    expect(entries[0]).toMatchObject({
      storagePath: 'Team Handbooks/Past Editions/new.pdf',
      size: 30,
      folder: {
        name: 'Team Handbooks/Past Editions',
        slugs: ['team-handbooks', 'past-editions'],
      },
    })
  })

  it('leaves bucket-root files without a folder', () => {
    expect(entries[2]).toMatchObject({
      storagePath: 'loose.pdf',
      folder: null,
    })
  })

  it('falls back to name order when timestamps match', () => {
    const sameTime = toAllFilesEntries([
      { folderPath: 'A', item: file('b.pdf') },
      { folderPath: 'A', item: file('a.pdf') },
    ])
    expect(sameTime.map((entry) => entry.name)).toEqual(['a.pdf', 'b.pdf'])
  })

  it('counts the folders the files came from', () => {
    expect(describeAllFiles(entries)).toBe('3 files across 2 folders')
    expect(describeAllFiles([])).toBe('0 files across 0 folders')
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
