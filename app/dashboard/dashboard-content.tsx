"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { format } from "date-fns"
import type { Profile, JournalEntry, Todo } from "@/types/database"
import { CheckCircle, Circle, Edit, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import supabaseClient from "@/utils/supabase-client"

interface DashboardContentProps {
  profile: Profile | null
  journalEntries: JournalEntry[]
  moods: any[] // Using any because of the nested join
  todos: Todo[]
}

export default function DashboardContent({ profile, journalEntries, moods, todos }: DashboardContentProps) {
  const [localTodos, setLocalTodos] = useState<Todo[]>(todos)

  const toggleTodoStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabaseClient.from("todos").update({ is_complete: !currentStatus }).eq("id", id)

      if (error) throw error

      // Update local state
      setLocalTodos(localTodos.map((todo) => (todo.id === id ? { ...todo, is_complete: !currentStatus } : todo)))
    } catch (error) {
      console.error("Error updating todo:", error)
    }
  }

  return (
    <Tabs defaultValue="overview">
      <TabsList className="mb-6">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="journal">Journal</TabsTrigger>
        <TabsTrigger value="moods">Moods</TabsTrigger>
        <TabsTrigger value="todos">Todos</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Journal Entries</CardTitle>
              <CardDescription>Your latest thoughts and reflections</CardDescription>
            </CardHeader>
            <CardContent>
              {journalEntries.length === 0 ? (
                <p className="text-muted-foreground">No journal entries yet.</p>
              ) : (
                <div className="space-y-4">
                  {journalEntries.map((entry) => (
                    <div key={entry.id} className="border-b pb-3">
                      <h3 className="font-medium">{entry.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{entry.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {format(new Date(entry.created_at), "MMM d, yyyy")}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/journal">View All Entries</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Moods</CardTitle>
              <CardDescription>Your emotional wellbeing</CardDescription>
            </CardHeader>
            <CardContent>
              {moods.length === 0 ? (
                <p className="text-muted-foreground">No mood entries yet.</p>
              ) : (
                <div className="space-y-4">
                  {moods.map((mood) => (
                    <div key={mood.id} className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: mood.mood_category?.color || "#888" }}
                      >
                        {getMoodEmoji(mood.mood_category?.name || "")}
                      </div>
                      <div>
                        <p className="font-medium">{mood.mood_category?.name || "Unknown"}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(mood.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/mood-tracker">View Mood History</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="journal">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Journal Entries</CardTitle>
              <CardDescription>Your thoughts and reflections</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/journal/new">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Entry
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {journalEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't created any journal entries yet.</p>
                <Button asChild>
                  <Link href="/journal/new">Create Your First Entry</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {journalEntries.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-lg">{entry.title}</h3>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/journal/${entry.id}`}>
                          <Edit className="h-4 w-4 mr-2" />
                          View
                        </Link>
                      </Button>
                    </div>
                    <p className="text-muted-foreground mt-2 line-clamp-3">{entry.content}</p>
                    <p className="text-xs text-muted-foreground mt-3">
                      {format(new Date(entry.created_at), "MMMM d, yyyy")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="moods">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Mood Tracker</CardTitle>
              <CardDescription>Your emotional wellbeing over time</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/mood-tracker">
                <PlusCircle className="h-4 w-4 mr-2" />
                Record Mood
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {moods.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You haven't recorded any moods yet.</p>
                <Button asChild>
                  <Link href="/mood-tracker">Record Your First Mood</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {moods.map((mood) => (
                  <div key={mood.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-12 h-12 rounded-full flex items-center justify-center text-white text-xl"
                        style={{ backgroundColor: mood.mood_category?.color || "#888" }}
                      >
                        {getMoodEmoji(mood.mood_category?.name || "")}
                      </div>
                      <div>
                        <h3 className="font-medium text-lg">{mood.mood_category?.name || "Unknown"}</h3>
                        <p className="text-sm text-muted-foreground">Score: {mood.mood_score}/5</p>
                      </div>
                    </div>
                    {mood.note && <p className="mt-3 text-sm bg-secondary/50 p-3 rounded-md">{mood.note}</p>}
                    <p className="text-xs text-muted-foreground mt-3">
                      {format(new Date(mood.created_at), "MMMM d, yyyy h:mm a")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="todos">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Todo List</CardTitle>
              <CardDescription>Keep track of your tasks</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link href="/todos">
                <PlusCircle className="h-4 w-4 mr-2" />
                New Task
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {localTodos.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have any tasks yet.</p>
                <Button asChild>
                  <Link href="/todos">Add Your First Task</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {localTodos.map((todo) => (
                  <div key={todo.id} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleTodoStatus(todo.id, todo.is_complete)} className="text-primary">
                        {todo.is_complete ? <CheckCircle className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                      </button>
                      <span className={todo.is_complete ? "line-through text-muted-foreground" : ""}>{todo.task}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{format(new Date(todo.created_at), "MMM d")}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

// Helper function to get emoji based on mood name
function getMoodEmoji(moodName: string): string {
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
