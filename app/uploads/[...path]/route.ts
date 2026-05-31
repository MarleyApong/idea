import { NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join, resolve } from "path"

const UPLOADS_DIR = join(process.cwd(), "public", "uploads")

const MIME: Record<string, string> = {
  jpg:  "image/jpeg",
  jpeg: "image/jpeg",
  png:  "image/png",
  webp: "image/webp",
  pdf:  "application/pdf",
  txt:  "text/plain; charset=utf-8",
  md:   "text/markdown; charset=utf-8",
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params
  const filePath = resolve(join(UPLOADS_DIR, ...path))

  if (!filePath.startsWith(UPLOADS_DIR)) {
    return new NextResponse("Forbidden", { status: 403 })
  }

  try {
    const file = await readFile(filePath)
    const ext = filePath.split(".").pop()?.toLowerCase() ?? ""
    const contentType = MIME[ext] ?? "application/octet-stream"

    return new NextResponse(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new NextResponse("Not found", { status: 404 })
  }
}
