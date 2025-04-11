"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Loader2 } from "lucide-react"
import MoodChart from "@/components/mood-chart"
import MoodInsights from "@/components/mood-insights"
import JournalInsights from "@/components/journal-insights"

export default function InsightsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // Check if user is logged in
  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
      } else {
        router.push("/login")
      }
      setLoading(false)
    }

    checkUser()
  }, [router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // This will prevent a flash of content before redirecting
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Your Insights</h1>
        <p className="text-muted-foreground mt-1">Personalized analysis of your mental health data</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <MoodInsights />
        <JournalInsights />
      </div>

      <MoodChart />

      <div className="bg-secondary/50 p-6 rounded-lg">
        <h2 className="text-xl font-bold mb-2">Recommendations</h2>
        <p className="text-muted-foreground mb-4">
          Based on your recent mood and journal entries, here are some personalized recommendations:
        </p>
        <ul className="space-y-2">
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-primary/20 p-1 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <span>Continue your journaling streak to maintain awareness of your emotions</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-primary/20 p-1 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <span>Practice mindfulness when you notice your mood declining</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="rounded-full bg-primary/20 p-1 mt-0.5">
              <div className="h-2 w-2 rounded-full bg-primary" />
            </div>
            <span>Set a reminder to track your mood at the same time each day</span>
          </li>
        </ul>
      </div>
    </div>
  )
}

