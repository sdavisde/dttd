'use client'

import { createClient } from '@/lib/supabase/client'
import { FileObject } from '@supabase/storage-js'

type FileTableProps = {
  files: FileObject[]
  folder: string
}

export function FileTable({ files, folder }: FileTableProps) {
  return (
    <table className='min-w-full'>
      <thead>
        <tr className='border-b'>
          <th className='text-left p-4'>File Name</th>
          <th className='p-4'>Actions</th>
        </tr>
      </thead>
      <tbody>
        {files.map((file) => (
          <tr
            key={file.name}
            className='border-b'
          >
            <td className='p-4'>{file.name}</td>
            <td className='p-4 flex justify-end gap-4'>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  const { data, error } = await supabase.storage.from('files').download(`${folder}/${file.name}`)
                  if (error) {
                    console.error('Error downloading file:', error)
                    return
                  }
                  const url = window.URL.createObjectURL(data)
                  const a = document.createElement('a')
                  a.href = url
                  a.download = file.name
                  a.click()
                  window.URL.revokeObjectURL(url)
                }}
                className='text-blue-600 hover:text-blue-800'
              >
                Download
              </button>
              <button
                onClick={async () => {
                  const supabase = createClient()
                  const { data } = await supabase.storage.from('files').getPublicUrl(`${folder}/${file.name}`)
                  window.open(data.publicUrl, '_blank')
                }}
                className='text-green-600 hover:text-green-800'
              >
                Preview
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
