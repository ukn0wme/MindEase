"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { format, subDays, eachDayOfInterval } from "date-fns"
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

export default function MoodTrackerPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [moodCategories, setMoodCategories] = useState<MoodCategory[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchMoodCategories()
    fetchMoods()
  }, [])

  const fetchMoodCategories = async () => {
    try {
      const { data, error } = await supabase.from("mood_categories").select("*")

      if (error) throw error

      if (data) {
        setMoodCategories(data)
      }
    } catch (error) {
      console.error("Error fetching mood categories:", error)
    }
  }

  const fetchMoods = async () => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      // Get moods for the last 30 days
      const thirtyDaysAgo = subDays(new Date(), 30).toISOString()

      const { data, error } = await supabase
        .from("moods")
        .select("*, mood_category_id(*)")
        .eq("user_id", user.id)
        .gte("created_at", thirtyDaysAgo)
        .order("created_at", { ascending: false })

      if (error) throw error

      setMoods(data || [])
    } catch (error) {
      console.error("Error fetching moods:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // Generate data for the mood calendar
  const last30Days = eachDayOfInterval({
    start: subDays(new Date(), 29),
    end: new Date(),
  })

  // Group moods by date
  const moodsByDate = moods.reduce(
    (acc, mood) => {
      const date = new Date(mood.created_at).toISOString().split("T")[0]
      if (!acc[date]) {
        acc[date] = []
      }
      acc[date].push(mood)
      return acc
    },
    {} as Record<string, MoodEntry[]>,
  )

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

    // If mood_category_id is just an ID, find the category
    const category = moodCategories.find((cat) => cat.id === mood.mood_category_id)
    return category ? category.name : "Unknown"
  }

  // Get mood color from category
  const getMoodColor = (mood: MoodEntry): string => {
    if (typeof mood.mood_category_id === "object" && mood.mood_category_id !== null) {
      return mood.mood_category_id.color
    }

    // If mood_category_id is just an ID, find the category
    const category = moodCategories.find((cat) => cat.id === mood.mood_category_id)
    return category ? category.color : "#94a3b8"
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Mood Tracker</h1>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Your Mood History</CardTitle>
            <CardDescription>Track your emotional wellbeing over time</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-2">
              {last30Days.map((day) => {
                const dateStr = day.toISOString().split("T")[0]
                const dayMoods = moodsByDate[dateStr] || []
                const latestMood = dayMoods[0]

                return (
                  <div
                    key={dateStr}
                    className="aspect-square flex flex-col items-center justify-center p-1 rounded-md border"
                  >
                    <div className="text-xs text-muted-foreground">{format(day, "MMM d")}</div>
                    {latestMood ? (
                      <>
                        <div
                          className="w-8 h-8 rounded-full my-1 flex items-center justify-center text-white"
                          style={{ backgroundColor: getMoodColor(latestMood) }}
                        >
                          {getMoodEmoji(getMoodName(latestMood))}
                        </div>
                        <div className="text-xs font-medium">{getMoodName(latestMood)}</div>
                      </>
                    ) : (
                      <div className="text-xs text-muted-foreground mt-2">No data</div>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Mood Entries</CardTitle>
            <CardDescription>Your latest mood check-ins</CardDescription>
          </CardHeader>
          <CardContent>
            {moods.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">You haven't recorded any moods yet.</p>
            ) : (
              <div className="space-y-4">
                {moods.slice(0, 10).map((mood) => (
                  <Link key={mood.id} href={`/mood-details/${mood.id}`}>
                    <div className="flex items-center p-3 bg-secondary rounded-lg hover:bg-secondary/80 transition-colors">
                      <div
                        className="w-10 h-10 rounded-full mr-4 flex items-center justify-center text-white"
                        style={{ backgroundColor: getMoodColor(mood) }}
                      >
                        {getMoodEmoji(getMoodName(mood))}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{getMoodName(mood)}</div>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(mood.created_at), "MMMM d, yyyy 'at' h:mm a")}
                        </div>
                        {mood.note && <div className="mt-2 text-sm">{mood.note}</div>}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
