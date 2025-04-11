"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, Save, ArrowLeft } from "lucide-react"
import { supabase } from "@/utils/supabase"
import { toast } from "@/components/ui/use-toast"
import { getDemoMode } from "@/utils/demo-mode"
import Link from "next/link"

export default function ClaudeSettingsPage() {
  const [apiKey, setApiKey] = useState("")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)

        if (getDemoMode()) {
          setApiKey("sk-demo-***********************************")
          setLoading(false)
          return
        }

        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return

        const { data, error } = await supabase
          .from("user_settings")
          .select("claude_api_key")
          .eq("user_id", user.id)
          .single()

        if (error && error.code !== "PGRST116") {
          throw error
        }

        if (data?.claude_api_key) {
          // Mask the API key for display
          const maskedKey = data.claude_api_key.substring(0, 8) + "***********************************"
          setApiKey(maskedKey)
        }
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid API key",
        variant: "destructive",
      })
      return
    }

    try {
      setSaving(true)

      if (getDemoMode()) {
        setTimeout(() => {
          toast({
            title: "Demo Mode",
            description: "In a real account, your API key would be saved.",
          })
          setSaving(false)
        }, 1000)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Only save if it's a new key (not masked)
      if (!apiKey.includes("*")) {
        const { data, error: fetchError } = await supabase
          .from("user_settings")
          .select("id")
          .eq("user_id", user.id)
          .single()

        if (fetchError && fetchError.code !== "PGRST116") {
          throw fetchError
        }

        if (data) {
          // Update existing settings
          const { error } = await supabase
            .from("user_settings")
            .update({
              claude_api_key: apiKey,
              updated_at: new Date().toISOString(),
            })
            .eq("user_id", user.id)

          if (error) throw error
        } else {
          // Insert new settings
          const { error } = await supabase.from("user_settings").insert({
            user_id: user.id,
            claude_api_key: apiKey,
          })

          if (error) throw error
        }

        // Mask the API key for display after saving
        const maskedKey = apiKey.substring(0, 8) + "***********************************"
        setApiKey(maskedKey)
      }

      toast({
        title: "Success",
        description: "Claude API key saved successfully",
      })
    } catch (error) {
      console.error("Error saving API key:", error)
      toast({
        title: "Error",
        description: "Failed to save API key",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center mb-8">
        <Link href="/settings" className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Claude 3.7 Settings</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claude 3.7 API Key</CardTitle>
          <CardDescription>Enter your Claude 3.7 API key to enable the AI therapist functionality</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
              />
              <p className="text-sm text-muted-foreground">
                You can get your Claude API key from the Langdock dashboard
              </p>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save API Key
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

