"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Loader2, Key, Bot, User } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/utils/supabase"

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true)
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) return
      } catch (error) {
        console.error("Error loading settings:", error)
      } finally {
        setLoading(false)
      }
    }

    loadSettings()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <Tabs defaultValue="ai">
        <TabsList className="mb-6">
          <TabsTrigger value="ai">AI Settings</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>

        <TabsContent value="ai" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>AI Assistants</CardTitle>
              <CardDescription>Configure your AI assistants for therapy and chat</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Bot className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Claude 3.7 Sonnet</h3>
                    <p className="text-sm text-muted-foreground">Mental Health Therapist AI</p>
                  </div>
                </div>
                <Link href="/settings/claude">
                  <Button>Configure</Button>
                </Link>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <Key className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">OpenAI</h3>
                    <p className="text-sm text-muted-foreground">General purpose AI assistant</p>
                  </div>
                </div>
                <Link href="/settings/openai">
                  <Button>Configure</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>Manage your account preferences and profile</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                <div className="flex items-center gap-3">
                  <User className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Profile</h3>
                    <p className="text-sm text-muted-foreground">Update your personal information</p>
                  </div>
                </div>
                <Link href="/profile">
                  <Button>Edit Profile</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
