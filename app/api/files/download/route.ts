import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const bucket = searchParams.get('bucket') ?? 'files'
    const path = searchParams.get('path')

    if (!path) {
      return new NextResponse('Missing file path', { status: 400 })
    }

    const supabase = await createClient()

    // Get file data
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucket)
      .download(path)

    if (downloadError) {
      logger.error(`Error downloading file: ${downloadError.message}`)
      return new NextResponse('File not found', { status: 404 })
    }

    // Get file metadata for proper filename and content type
    const { data: fileInfo } = await supabase.storage
      .from(bucket)
      .list(path.split('/').slice(0, -1).join('/') || '', {
        search: path.split('/').pop(),
      })

    const fileName = path.split('/').pop() ?? 'download'
    const fileMetadata = fileInfo?.[0]
    const contentType =
      fileMetadata?.metadata?.mimetype ?? 'application/octet-stream'

    // Convert blob to array buffer
    const arrayBuffer = await fileData.arrayBuffer()

    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Type': contentType,
        'Content-Length': arrayBuffer.byteLength.toString(),
      },
    })
  } catch (error) {
    logger.error(`Error in file download route: ${error}`)
    return new NextResponse('Internal server error', { status: 500 })
  }
}
