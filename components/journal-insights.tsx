"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getJournalEntries, getJournalCount } from "@/utils/database"
import { Loader2, Calendar, BookOpen } from "lucide-react"

export default function JournalInsights() {
  const [entries, setEntries] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [wordCounts, setWordCounts] = useState<number[]>([])
  const [streakDays, setStreakDays] = useState(0)

  useEffect(() => {
    async function loadJournalData() {
      setLoading(true)
      const [entriesData, countData] = await Promise.all([getJournalEntries(30), getJournalCount()])

      setEntries(entriesData)
      setTotalCount(countData || 0)

      // Calculate word counts for each entry
      const counts = entriesData.map((entry) => entry.content.split(/\s+/).length)
      setWordCounts(counts)

      // Calculate current streak
      const streak = calculateStreak(entriesData)
      setStreakDays(streak)

      setLoading(false)
    }

    loadJournalData()
  }, [])

  // Calculate the current journaling streak
  const calculateStreak = (journalEntries: any[]) => {
    if (journalEntries.length === 0) return 0

    // Sort by date descending
    const sortedEntries = [...journalEntries].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    // Check if there's an entry for today
    const todayEntry = sortedEntries.find((entry) => {
      const entryDate = new Date(entry.created_at)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate.getTime() === currentDate.getTime()
    })

    if (!todayEntry) {
      // If no entry today, check if there was one yesterday
      const yesterday = new Date(currentDate)
      yesterday.setDate(yesterday.getDate() - 1)

      const yesterdayEntry = sortedEntries.find((entry) => {
        const entryDate = new Date(entry.created_at)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === yesterday.getTime()
      })

      if (!yesterdayEntry) return 0

      // Start counting from yesterday
      currentDate = yesterday
    }

    // Count consecutive days with entries
    for (let i = 0; i < 100; i++) {
      // Limit to avoid infinite loop
      const dayToCheck = new Date(currentDate)
      dayToCheck.setDate(dayToCheck.getDate() - i)

      const entryForDay = sortedEntries.find((entry) => {
        const entryDate = new Date(entry.created_at)
        entryDate.setHours(0, 0, 0, 0)
        return entryDate.getTime() === dayToCheck.getTime()
      })

      if (entryForDay) {
        streak++
      } else {
        break
      }
    }

    return streak
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Calculate average word count
  const avgWordCount =
    wordCounts.length > 0 ? Math.round(wordCounts.reduce((sum, count) => sum + count, 0) / wordCounts.length) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journal Insights</CardTitle>
        <CardDescription>Analysis of your journaling habits</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
            <BookOpen className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Total Entries</div>
              <div className="text-2xl font-bold">{totalCount}</div>
            </div>
          </div>

          <div className="bg-secondary/50 p-4 rounded-lg flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <div className="text-sm text-muted-foreground">Current Streak</div>
              <div className="text-2xl font-bold">
                {streakDays} {streakDays === 1 ? "day" : "days"}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium mb-1">Average Entry Length</h4>
            <p className="text-2xl font-bold">
              {avgWordCount} <span className="text-sm font-normal text-muted-foreground">words</span>
            </p>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-2">Recent Topics</h4>
            <div className="flex flex-wrap gap-2">
              {entries.length > 0 ? (
                extractTopics(entries).map((topic, index) => (
                  <span key={index} className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
                    {topic}
                  </span>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No journal entries yet</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Extract common topics from journal entries
function extractTopics(entries: any[]): string[] {
  // This is a simplified implementation
  // In a real app, you might use NLP or more sophisticated text analysis

  const commonTopics = [
    "anxiety",
    "stress",
    "sleep",
    "work",
    "family",
    "exercise",
    "meditation",
    "gratitude",
    "goals",
    "health",
    "relationships",
  ]

  const allText = entries
    .map((entry) => entry.title + " " + entry.content)
    .join(" ")
    .toLowerCase()

  return commonTopics.filter((topic) => allText.includes(topic)).slice(0, 6) // Limit to 6 topics
}
