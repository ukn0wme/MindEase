"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getDemoMode, DEMO_JOURNAL_ENTRIES } from "@/utils/demo-mode"
import { toast } from "@/components/ui/use-toast"

export default function EditJournalEntryPage({ params }: { params: { id: string } }) {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const { id } = params

  useEffect(() => {
    fetchJournalEntry()
  }, [id])

  const fetchJournalEntry = async () => {
    try {
      setLoading(true)

      if (getDemoMode()) {
        const demoEntry = DEMO_JOURNAL_ENTRIES.find((entry) => entry.id === id)
        if (demoEntry) {
          setEntry(demoEntry)
          setTitle(demoEntry.title)
          setContent(demoEntry.content)
        } else {
          router.push("/journal")
        }
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single()

      if (error || !data) {
        console.error("Error fetching journal entry:", error)
        router.push("/journal")
        return
      }

      setEntry(data)
      setTitle(data.title)
      setContent(data.content)
    } catch (error) {
      console.error("Error fetching journal entry:", error)
      router.push("/journal")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!title.trim() || !content.trim()) {
      toast({
        title: "Error",
        description: "Please provide both a title and content for your journal entry.",
        variant: "destructive",
      })
      return
    }

    setSubmitting(true)

    try {
      if (getDemoMode()) {
        // In demo mode, just show a success message
        setTimeout(() => {
          toast({
            title: "Demo Mode",
            description: "In a real account, your journal entry would be updated.",
          })
          router.push(`/journal/${id}`)
        }, 1000)
        return
      }

      const { error } = await supabase
        .from("journal_entries")
        .update({
          title: title.trim(),
          content: content.trim(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Your journal entry has been updated.",
      })

      router.push(`/journal/${id}`)
    } catch (error) {
      console.error("Error updating journal entry:", error)
      toast({
        title: "Error",
        description: "There was an error updating your journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!entry) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Journal Entry Not Found</h2>
        <p className="text-muted-foreground mb-6">
          The journal entry you're looking for doesn't exist or you don't have permission to edit it.
        </p>
        <Button asChild>
          <Link href="/journal">Back to Journal</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link href={`/journal/${id}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Edit Journal Entry</h1>
      </div>

      <Card className="max-w-3xl mx-auto">
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Edit Entry</CardTitle>
            <CardDescription>Update your journal entry.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Write your thoughts here..."
                rows={12}
                required
                className="resize-none"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.push(`/journal/${id}`)}>
              Cancel
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      {getDemoMode() && (
        <div className="max-w-3xl mx-auto mt-4 bg-primary/10 p-4 rounded-lg text-primary text-sm">
          <p className="font-medium">You're currently in Demo Mode</p>
          <p className="mt-1">In demo mode, journal entries aren't actually saved to the database.</p>
        </div>
      )}
    </div>
  )
}

