import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "public", "surat_pernyataan_keberatan.pdf");
    const fileBuffer = fs.readFileSync(filePath);
    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "inline; filename=surat_pernyataan_keberatan.pdf",
      },
    });
  } catch (error) {
    console.error("Failed to read PDF file", error);
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }
}
