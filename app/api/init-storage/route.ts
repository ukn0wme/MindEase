import { NextResponse } from "next/server"
import { setupStorage } from "@/utils/setup-storage"

export async function GET() {
  try {
    await setupStorage()
    return NextResponse.json({ success: true, message: "Storage initialization attempted" })
  } catch (error) {
    console.error("Error initializing storage:", error)

    // Return a 200 status even if there's an RLS error, since this is expected
    return NextResponse.json(
      {
        success: false,
        message: "Storage initialization may require admin privileges",
        error: String(error),
      },
      { status: 200 },
    )
  }
}

