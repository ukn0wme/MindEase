import { NextResponse } from "next/server"
import { seedAllData } from "@/utils/seed-data"

export async function GET() {
  try {
    await seedAllData()
    return NextResponse.json({ success: true, message: "Database seeded successfully" })
  } catch (error) {
    console.error("Error seeding database:", error)
    return NextResponse.json(
      { success: false, message: "Failed to seed database", error: String(error) },
      { status: 500 },
    )
  }
}
