"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, ArrowRight } from "lucide-react"
import { supabase } from "@/utils/supabase"
import { format, subMonths, addMonths, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns"
import Link from "next/link"

interface MoodCategory {
  id: string
  name: string
  description: string
  color: string
}

interface MoodEntry {
  id: string
  user_id: string
  mood_category_id: string | MoodCategory
  mood_score: number
  note: string | null
  created_at: string
}

export default function MoodHistoryPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedMood, setSelectedMood] = useState<MoodEntry | null>(null)

  useEffect(() => {
    fetchMoods()
  }, [currentMonth])

  const fetchMoods = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const monthStart = startOfMonth(currentMonth)
      const monthEnd = endOfMonth(currentMonth)

      const { data, error } = await supabase
        .from("moods")
        .select("*, mood_category_id(*)")
        .eq("user_id", user.id)
        .gte("created_at", monthStart.toISOString())
        .lte("created_at", monthEnd.toISOString())
        .order("created_at", { ascending: false })

      if (error) throw error

      setMoods(data || [])
    } catch (error) {
      console.error("Error fetching moods:", error)
    } finally {
      setLoading(false)
    }
  }

  const previousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1))
    setSelectedDate(null)
    setSelectedMood(null)
  }

  const nextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1))
    setSelectedDate(null)
    setSelectedMood(null)
  }

  const handleDateClick = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]

    if (selectedDate === dateStr) {
      // Deselect if already selected
      setSelectedDate(null)
      setSelectedMood(null)
      return
    }

    setSelectedDate(dateStr)

    // Find mood for this date
    const moodForDate = moods.find((mood) => new Date(mood.created_at).toISOString().split("T")[0] === dateStr)

    setSelectedMood(moodForDate || null)
  }

  // Generate calendar days
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Get mood for a specific date
  const getMoodForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return moods.find((mood) => new Date(mood.created_at).toISOString().split("T")[0] === dateStr)
  }

  // Get mood emoji
  const getMoodEmoji = (moodName: string): string => {
    const emojiMap: Record<string, string> = {
      Happy: "😄",
      Calm: "😌",
      Sad: "😢",
      Anxious: "😰",
      Angry: "😠",
      Tired: "😴",
      Energetic: "⚡",
      Stressed: "😫",
    }

    return emojiMap[moodName] || "😐"
  }

  // Get mood name from category
  const getMoodName = (mood: MoodEntry): string => {
    if (typeof mood.mood_category_id === "object" && mood.mood_category_id !== null) {
      return mood.mood_category_id.name
    }

    return "Unknown"
  }

  // Get mood color from category
  const getMoodColor = (mood: MoodEntry): string => {
    if (typeof mood.mood_category_id === "object" && mood.mood_category_id !== null) {
      return mood.mood_category_id.color
    }

    return "#94a3b8"
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Mood History</h1>
        <Link href="/dashboard">
          <Button variant="outline">Back to Dashboard</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Mood Calendar</CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={previousMonth}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <span className="font-medium">{format(currentMonth, "MMMM yyyy")}</span>
              <Button variant="outline" size="icon" onClick={nextMonth}>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <CardDescription>Click on a day to view your mood details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-medium py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {/* Add empty cells for days before the first day of the month */}
            {Array.from({ length: daysInMonth[0].getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="aspect-square" />
            ))}

            {daysInMonth.map((day) => {
              const mood = getMoodForDate(day)
              const dateStr = day.toISOString().split("T")[0]
              const isSelected = selectedDate === dateStr
              const isToday = new Date().toISOString().split("T")[0] === dateStr

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => handleDateClick(day)}
                  className={`aspect-square flex flex-col items-center justify-center p-1 rounded-md border transition-all ${
                    isSelected ? "ring-2 ring-primary ring-offset-2" : isToday ? "border-primary" : ""
                  }`}
                >
                  <span className={`text-sm ${isToday ? "font-bold" : ""}`}>{format(day, "d")}</span>
                  {mood ? (
                    <div
                      className="w-8 h-8 mt-1 rounded-full flex items-center justify-center text-white"
                      style={{ backgroundColor: getMoodColor(mood) }}
                    >
                      {getMoodEmoji(getMoodName(mood))}
                    </div>
                  ) : null}
                </button>
              )
            })}
          </div>

          {selectedMood && (
            <div className="mt-6 p-4 bg-secondary/50 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                  style={{ backgroundColor: getMoodColor(selectedMood) }}
                >
                  {getMoodEmoji(getMoodName(selectedMood))}
                </div>
                <div>
                  <div className="font-medium">{getMoodName(selectedMood)}</div>
                  <div className="text-sm text-muted-foreground">
                    {format(new Date(selectedMood.created_at), "MMMM d, yyyy 'at' h:mm a")}
                  </div>
                </div>
              </div>

              {selectedMood.note && (
                <div className="mt-2 p-3 bg-background rounded-md">
                  <p className="text-sm">{selectedMood.note}</p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
