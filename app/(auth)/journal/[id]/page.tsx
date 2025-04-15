"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { getDemoMode, DEMO_JOURNAL_ENTRIES } from "@/utils/demo-mode"
import { toast } from "@/components/ui/use-toast"

export default function JournalEntryPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
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
    } catch (error) {
      console.error("Error fetching journal entry:", error)
      router.push("/journal")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this journal entry? This action cannot be undone.")) {
      return
    }

    setDeleting(true)

    try {
      if (getDemoMode()) {
        // In demo mode, just show a success message
        setTimeout(() => {
          toast({
            title: "Demo Mode",
            description: "In a real account, your journal entry would be deleted.",
          })
          router.push("/journal")
        }, 1000)
        return
      }

      const { error } = await supabase.from("journal_entries").delete().eq("id", id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Journal entry deleted successfully.",
      })

      router.push("/journal")
    } catch (error) {
      console.error("Error deleting journal entry:", error)
      toast({
        title: "Error",
        description: "Failed to delete journal entry. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
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
          The journal entry you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <Button asChild>
          <Link href="/journal">Back to Journal</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <Link href="/journal" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Journal Entry</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/journal/edit/${id}`}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleting}>
            {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
            Delete
          </Button>
        </div>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl">{entry.title}</CardTitle>
          <p className="text-sm text-muted-foreground">
            {format(new Date(entry.created_at), "MMMM d, yyyy 'at' h:mm a")}
          </p>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            {entry.content.split("\n").map((paragraph: string, index: number) => (
              <p key={index} className="mb-4 whitespace-pre-wrap">
                {paragraph}
              </p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/journal">Back to Journal</Link>
          </Button>
        </CardFooter>
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
