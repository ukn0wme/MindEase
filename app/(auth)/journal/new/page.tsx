"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { getDemoMode } from "@/utils/demo-mode"
import { toast } from "@/components/ui/use-toast"
import JournalPrompts from "@/components/journal-prompts"

export default function NewJournalEntryPage() {
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()

  const handlePromptSelect = (promptText: string) => {
    setContent(promptText)
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
            description: "In a real account, your journal entry would be saved.",
          })
          router.push("/journal")
        }, 1000)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      const { error } = await supabase.from("journal_entries").insert({
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Your journal entry has been saved.",
      })

      router.push("/journal")
    } catch (error) {
      console.error("Error saving journal entry:", error)
      toast({
        title: "Error",
        description: "There was an error saving your journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link href="/journal" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">New Journal Entry</h1>
      </div>

      <div className="max-w-3xl mx-auto space-y-6">
        <JournalPrompts onSelectPrompt={handlePromptSelect} />

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Create a New Entry</CardTitle>
              <CardDescription>
                Express your thoughts, feelings, and experiences. Your journal is private and only visible to you.
              </CardDescription>
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
              <Button type="button" variant="outline" onClick={() => router.push("/journal")}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Entry"
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {getDemoMode() && (
          <div className="bg-primary/10 p-4 rounded-lg text-primary text-sm">
            <p className="font-medium">You're currently in Demo Mode</p>
            <p className="mt-1">In demo mode, journal entries aren't actually saved to the database.</p>
          </div>
        )}
      </div>
    </div>
  )
}

