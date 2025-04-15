import { NextResponse } from "next/server"
import { setupStorage } from "@/utils/setup-storage"
import { seedAllData } from "@/utils/seed-data"

export async function GET() {
  try {
    // Setup storage buckets
    await setupStorage()

    // Seed database with initial data
    await seedAllData()

    return NextResponse.json({
      success: true,
      message: "Application initialized successfully",
    })
  } catch (error) {
    console.error("Error initializing application:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Failed to initialize application",
        error: String(error),
      },
      { status: 500 },
    )
  }
}
