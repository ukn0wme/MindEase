import { NextResponse } from "next/server"
import { getClaudeApiKey } from "@/utils/claude"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { messages, systemPrompt, stream } = body

    const apiKey = await getClaudeApiKey()

    if (!apiKey) {
      return NextResponse.json({ error: "API key not found" }, { status: 401 })
    }

    const response = await fetch("https://api.langdock.com/anthropic/eu/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "claude-3-7-sonnet-20250219",
        system: systemPrompt,
        messages: messages,
        stream: stream,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json({ error: errorData.error?.message || response.statusText }, { status: response.status })
    }

    // For streaming responses, we need to forward the stream
    if (stream) {
      // Create a new ReadableStream to forward the response
      const encoder = new TextEncoder()
      const decoder = new TextDecoder()

      const transformStream = new TransformStream({
        async transform(chunk, controller) {
          controller.enqueue(chunk)
        },
      })

      // Pipe the response body to our transform stream
      response.body?.pipeTo(transformStream.writable)

      return new Response(transformStream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    }

    // For non-streaming responses, just return the JSON
    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in chat API route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

