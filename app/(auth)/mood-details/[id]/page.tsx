"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, ArrowLeft, Trash2, Edit, Save } from "lucide-react"
import { supabase } from "@/utils/supabase"
import { format } from "date-fns"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

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

export default function MoodDetailsPage({ params }: { params: { id: string } }) {
  const [mood, setMood] = useState<MoodEntry | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [note, setNote] = useState("")
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchMood()
  }, [params.id])

  const fetchMood = async () => {
    setLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("moods")
        .select("*, mood_category_id(*)")
        .eq("id", params.id)
        .eq("user_id", user.id)
        .single()

      if (error) throw error

      if (!data) {
        router.push("/mood-tracker")
        return
      }

      setMood(data)
      setNote(data.note || "")
    } catch (error) {
      console.error("Error fetching mood:", error)
      toast({
        title: "Error",
        description: "Could not load the mood entry.",
        variant: "destructive",
      })
      router.push("/mood-tracker")
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!mood) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from("moods")
        .update({
          note: note.trim() || null,
        })
        .eq("id", mood.id)

      if (error) throw error

      setMood({
        ...mood,
        note: note.trim() || null,
      })

      setEditing(false)
      toast({
        title: "Success",
        description: "Mood note updated successfully.",
      })
    } catch (error) {
      console.error("Error updating mood:", error)
      toast({
        title: "Error",
        description: "Could not update the mood entry.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!mood) return

    setDeleting(true)
    try {
      const { error } = await supabase.from("moods").delete().eq("id", mood.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Mood entry deleted successfully.",
      })
      router.push("/mood-tracker")
    } catch (error) {
      console.error("Error deleting mood:", error)
      toast({
        title: "Error",
        description: "Could not delete the mood entry.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  // Get mood name from category
  const getMoodName = (): string => {
    if (!mood) return "Unknown"

    if (typeof mood.mood_category_id === "object" && mood.mood_category_id !== null) {
      return mood.mood_category_id.name
    }

    return "Unknown"
  }

  // Get mood color from category
  const getMoodColor = (): string => {
    if (!mood) return "#94a3b8"

    if (typeof mood.mood_category_id === "object" && mood.mood_category_id !== null) {
      return mood.mood_category_id.color
    }

    return "#94a3b8"
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!mood) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Mood entry not found.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <Link href="/mood-tracker">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Mood Tracker
          </Button>
        </Link>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" className="gap-2">
              <Trash2 className="h-4 w-4" />
              Delete
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete this mood entry.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                disabled={deleting}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {deleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mood Details</CardTitle>
          <CardDescription>Recorded on {format(new Date(mood.created_at), "MMMM d, yyyy 'at' h:mm a")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-white text-3xl"
              style={{ backgroundColor: getMoodColor() }}
            >
              {getMoodEmoji(getMoodName())}
            </div>
            <div>
              <h3 className="text-2xl font-bold">{getMoodName()}</h3>
              <p className="text-muted-foreground">Mood Score: {mood.mood_score}/5</p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            {editing ? (
              <div className="space-y-2">
                <Textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Add notes about how you were feeling..."
                  rows={5}
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setEditing(false)
                      setNote(mood.note || "")
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="bg-secondary/50 p-4 rounded-lg">
                {mood.note ? <p>{mood.note}</p> : <p className="text-muted-foreground italic">No notes added</p>}
                <Button variant="ghost" size="sm" onClick={() => setEditing(true)} className="mt-2">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Notes
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

