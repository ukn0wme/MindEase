"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Loader2, Plus } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/utils/supabase"
import MoodTracker from "@/components/mood-tracker"
import MoodChart from "@/components/mood-chart"
import MoodInsights from "@/components/mood-insights"
import MoodStatistics from "@/components/mood-statistics"
import JournalEntries from "@/components/journal-entries"
import ResourceList from "@/components/resource-list"
import { getDemoMode } from "@/utils/demo-mode"

export default function Dashboard() {
  const [userName, setUserName] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUserProfile() {
      try {
        setLoading(true)

        if (getDemoMode()) {
          setUserName("Demo User")
          setLoading(false)
          return
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase.from("profiles").select("full_name").eq("id", user.id).single()

        if (error) throw error

        setUserName(data?.full_name || user.email?.split("@")[0] || "User")
      } catch (error) {
        console.error("Error loading user profile:", error)
      } finally {
        setLoading(false)
      }
    }

    loadUserProfile()
  }, [])

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
        <h1 className="text-3xl font-bold">Welcome, {userName}</h1>
        <Link href="/journal/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Journal Entry
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="mood">
        <TabsList className="mb-6">
          <TabsTrigger value="mood">Mood</TabsTrigger>
          <TabsTrigger value="journal">Journal</TabsTrigger>
          <TabsTrigger value="resources">Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="mood" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Mood</CardTitle>
                <CardDescription>How are you feeling today?</CardDescription>
              </CardHeader>
              <CardContent>
                <MoodTracker />
              </CardContent>
            </Card>

            <MoodInsights />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MoodChart />
            <MoodStatistics />
          </div>

          <div className="flex justify-end">
            <Link href="/mood-tracker">
              <Button variant="outline">View Detailed Mood History</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="journal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>Your latest reflections and thoughts</CardDescription>
            </CardHeader>
            <CardContent>
              <JournalEntries limit={5} />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Link href="/journal">
              <Button variant="outline">View All Journal Entries</Button>
            </Link>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Mental Health Resources</CardTitle>
              <CardDescription>Helpful articles, guides, and tools</CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

