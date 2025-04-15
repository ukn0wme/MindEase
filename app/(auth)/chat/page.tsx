"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Send, Bot, User, AlertCircle } from "lucide-react"
import { supabase } from "@/utils/supabase"
import { toast } from "@/components/ui/use-toast"
import { getDemoMode } from "@/utils/demo-mode"
import { type ClaudeMessage, sendMessageToClaude } from "@/utils/claude"
import ReactMarkdown from "react-markdown"

export default function ChatPage() {
  const [messages, setMessages] = useState<ClaudeMessage[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadChatHistory()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadChatHistory = async () => {
    try {
      if (getDemoMode()) {
        // Set some demo messages
        setMessages([
          { role: "assistant", content: "Hello! I'm Claude, your mental health assistant. How can I help you today?" },
        ])
        setInitialLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setInitialLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("chat_messages")
        .select("role, content, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
        .limit(50)

      if (error) throw error

      if (data && data.length > 0) {
        setMessages(data.map((msg) => ({ role: msg.role as "user" | "assistant", content: msg.content })))
      } else {
        // Set initial message if no history
        setMessages([
          { role: "assistant", content: "Hello! I'm Claude, your mental health assistant. How can I help you today?" },
        ])
      }
    } catch (error) {
      console.error("Error loading chat history:", error)
      toast({
        title: "Error",
        description: "Failed to load chat history",
        variant: "destructive",
      })
    } finally {
      setInitialLoading(false)
    }
  }

  const saveMessage = async (message: ClaudeMessage) => {
    if (getDemoMode()) return

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { error } = await supabase.from("chat_messages").insert({
        user_id: user.id,
        role: message.role,
        content: message.content,
      })

      if (error) throw error
    } catch (error) {
      console.error("Error saving message:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!input.trim()) return

    // Clear any previous errors
    setError(null)

    const userMessage: ClaudeMessage = { role: "user", content: input.trim() }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)

    try {
      await saveMessage(userMessage)

      try {
        const assistantResponse = await sendMessageToClaude([...messages, userMessage], undefined, (chunk) => {
          setMessages((prev) => {
            const newMessages = [...prev]
            const lastMessage = newMessages[newMessages.length - 1]

            if (lastMessage && lastMessage.role === "assistant") {
              lastMessage.content += chunk
            } else {
              newMessages.push({ role: "assistant", content: chunk })
            }

            return newMessages
          })
        })

        if (!assistantResponse) {
          throw new Error("Failed to get response from Claude")
        }

        // Save the complete assistant message
        await saveMessage({ role: "assistant", content: assistantResponse.content })
      } catch (apiError) {
        console.error("API Error:", apiError)

        // Set the error message for display
        setError(
          "There was an error connecting to the Claude API. This might be due to network issues or API limitations in the preview environment.",
        )

        // Add a fallback response in case of API errors
        const fallbackResponse = {
          role: "assistant",
          content:
            "I'm sorry, I'm having trouble connecting to my backend services right now. This could be due to network issues or API limitations in the preview environment. Please try again in a moment.",
        }

        setMessages((prev) => [...prev, fallbackResponse])
        await saveMessage(fallbackResponse)
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      })

      // Remove the partial assistant message if there was an error
      setMessages((prev) => {
        const newMessages = [...prev]
        if (newMessages[newMessages.length - 1]?.role === "assistant") {
          newMessages.pop()
        }
        return newMessages
      })
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">AI Therapist Chat</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="mb-4">
        <CardHeader className="pb-2">
          <CardTitle>Chat with Claude 3.7</CardTitle>
          <CardDescription>Your AI mental health assistant powered by Claude 3.7 Sonnet via Langdock</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto p-2">
            {messages.map((message, index) => (
              <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`flex items-start gap-2 max-w-[80%] ${message.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div className={`p-1 rounded-full ${message.role === "user" ? "bg-primary" : "bg-secondary"}`}>
                    {message.role === "user" ? (
                      <User className="h-6 w-6 text-primary-foreground" />
                    ) : (
                      <Bot className="h-6 w-6 text-primary" />
                    )}
                  </div>
                  <div
                    className={`p-3 rounded-lg ${
                      message.role === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                    }`}
                  >
                    <ReactMarkdown className="prose dark:prose-invert max-w-none">{message.content}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter>
          <div className="flex w-full items-center space-x-2">
            <Textarea
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              className="flex-1"
              disabled={loading}
            />
            <Button onClick={handleSendMessage} disabled={loading || !input.trim()} size="icon">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </CardFooter>
      </Card>

      {getDemoMode() && (
        <p className="text-xs text-muted-foreground text-center">
          In demo mode, responses are simulated and not from the actual Claude API.
        </p>
      )}
    </div>
  )
}
