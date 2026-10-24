import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ file: string }> }
) {
  try {
    const { file } = await params;
    const safeFilename = path.basename(file);
    const primaryDir = path.join(process.cwd(), "uploads");
    const tmpDir = path.join("/tmp", "uploads");

    let filePath = path.join(primaryDir, safeFilename);
    if (!fs.existsSync(filePath)) {
      filePath = path.join(tmpDir, safeFilename);
    }

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(safeFilename).toLowerCase();
    const isSvgContent = fileBuffer.slice(0, 100).toString("utf-8").trim().startsWith("<svg") ||
                         fileBuffer.slice(0, 100).toString("utf-8").trim().startsWith("<?xml");

    let contentType = "image/jpeg";
    if (isSvgContent || ext === ".svg") contentType = "image/svg+xml";
    else if (ext === ".png") contentType = "image/png";
    else if (ext === ".webp") contentType = "image/webp";

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, stale-while-revalidate=43200",
      },
    });
  } catch (error) {
    console.error("Error serving photo:", error);
    return NextResponse.json({ error: "Failed to serve photo" }, { status: 500 });
  }
}
