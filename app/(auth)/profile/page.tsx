"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Loader2, Upload, Info } from "lucide-react"
import { getDemoMode } from "@/utils/demo-mode"
import { toast } from "@/components/ui/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { checkAvatarsBucket, uploadAvatarToStorage, fileToDataUrl } from "@/utils/avatar-helper"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bucketAvailable, setBucketAvailable] = useState(true)
  const [usingFallback, setUsingFallback] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      if (getDemoMode()) {
        setUser({ id: "demo-user", email: "demo@mindease.app" })
        setProfile({ full_name: "Demo User" })
        setFullName("Demo User")
        setLoading(false)
        return
      }

      const { data } = await supabase.auth.getUser()

      if (!data.user) {
        router.push("/login")
        return
      }

      setUser(data.user)

      // Fetch user profile
      const { data: profileData } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

      if (profileData) {
        setProfile(profileData)
        setFullName(profileData.full_name || "")
        setAvatarUrl(profileData.avatar_url)
      }

      // Check if avatars bucket exists
      const bucketExists = await checkAvatarsBucket()
      setBucketAvailable(bucketExists)

      setLoading(false)
    }

    checkUser()
  }, [router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdating(true)
    setError(null)
    setSuccess(null)

    try {
      if (getDemoMode()) {
        // In demo mode, just show a success message
        setTimeout(() => {
          setSuccess("Profile updated successfully! (Demo Mode)")
          setUpdating(false)
        }, 1000)
        return
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (error) throw error

      setSuccess("Profile updated successfully!")
      toast({
        title: "Success",
        description: "Your profile has been updated.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      setError("Failed to update profile. Please try again.")
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpdating(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    const file = files[0]
    setUploadingAvatar(true)
    setError(null)
    setSuccess(null)
    setUsingFallback(false)

    try {
      if (getDemoMode()) {
        // In demo mode, just show a success message
        setTimeout(() => {
          // Create a temporary URL for the demo
          const tempUrl = URL.createObjectURL(file)
          setAvatarUrl(tempUrl)
          setSuccess("Profile picture updated successfully! (Demo Mode)")
          setUploadingAvatar(false)
        }, 1000)
        return
      }

      let finalAvatarUrl: string | null = null

      // Try to upload to storage if bucket is available
      if (bucketAvailable) {
        finalAvatarUrl = await uploadAvatarToStorage(file)
      }

      // If storage upload failed or bucket isn't available, use data URL as fallback
      if (!finalAvatarUrl) {
        console.log("Using data URL fallback for avatar")
        finalAvatarUrl = await fileToDataUrl(file)
        setUsingFallback(true)
      }

      // Update the user's profile with the avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({
          avatar_url: finalAvatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id)

      if (updateError) {
        console.error("Profile update error:", updateError)
        throw new Error(`Profile update failed: ${updateError.message}`)
      }

      setAvatarUrl(finalAvatarUrl)

      if (usingFallback) {
        setSuccess("Profile picture updated successfully (using local storage)!")
        toast({
          title: "Success",
          description: "Your profile picture has been updated using local storage.",
        })
      } else {
        setSuccess("Profile picture updated successfully!")
        toast({
          title: "Success",
          description: "Your profile picture has been updated.",
        })
      }
    } catch (error: any) {
      console.error("Error uploading avatar:", error)
      setError(`Failed to upload profile picture: ${error.message}`)
      toast({
        title: "Error",
        description: `Failed to upload profile picture: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setUploadingAvatar(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Your Profile</h1>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={avatarUrl || ""} alt={fullName} />
              <AvatarFallback className="text-lg">
                {fullName ? fullName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {!bucketAvailable && (
              <Alert className="bg-yellow-50 border-yellow-200 text-yellow-800">
                <Info className="h-4 w-4" />
                <AlertDescription>
                  Storage bucket not available. Profile pictures will be stored locally and may not persist across
                  sessions.
                </AlertDescription>
              </Alert>
            )}

            <div>
              <Button variant="outline" size="sm" className="relative" disabled={uploadingAvatar}>
                {uploadingAvatar ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Change Picture
                  </>
                )}
                <input
                  type="file"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  disabled={uploadingAvatar}
                />
              </Button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">{error}</div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
              {success}
            </div>
          )}

          {usingFallback && (
            <Alert className="bg-blue-50 border-blue-200 text-blue-800">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Your profile picture is using a local data URL format. It may not persist across sessions or devices.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input id="email" type="email" value={user?.email} disabled className="bg-muted" />
              <p className="text-xs text-muted-foreground">Your email cannot be changed</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium">
                Full Name
              </label>
              <Input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
              />
            </div>

            <Button type="submit" disabled={updating} className="w-full">
              {updating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Profile"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {getDemoMode() && (
        <div className="mt-4 bg-primary/10 p-4 rounded-lg text-primary text-sm">
          <p className="font-medium">You're currently in Demo Mode</p>
          <p className="mt-1">In demo mode, profile changes aren't actually saved to the database.</p>
        </div>
      )}
    </div>
  )
}

