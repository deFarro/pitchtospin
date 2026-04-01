import Anthropic from '@anthropic-ai/sdk'
import { Langfuse } from 'langfuse'
import { discogsTools, executeDiscogsToolCall } from '../tools/discogs.js'
import { emitTraceEvent } from './ingestion.js'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY,
  secretKey: process.env.LANGFUSE_SECRET_KEY,
  baseUrl: process.env.LANGFUSE_BASE_URL,
})

const MODEL = process.env.ANTHROPIC_MODEL ?? 'claude-haiku-4-5-20251001'

const SYSTEM_PROMPT = `You are PitchToSpin, a knowledgeable music assistant powered by the Discogs database.
You help users discover music, explore artists, find records, and browse marketplace listings.
You have access to the Discogs API through tools. Use them to provide accurate, real-time information.
Be concise, helpful, and passionate about music.`

interface HistoryMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function handleChat(
  message: string,
  history: HistoryMessage[],
): Promise<string> {
  const trace = langfuse.trace({ name: 'agent-chat', input: { message } })
  const startTime = Date.now()
  let totalTokens = 0
  let error: string | null = null

  try {
    const messages: Anthropic.MessageParam[] = [
      ...history.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
      { role: 'user', content: message },
    ]

    const generation = trace.generation({
      name: 'claude-response',
      model: MODEL,
      input: messages,
    })

    let response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      tools: discogsTools,
      messages,
    })

    totalTokens += (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0)

    while (response.stop_reason === 'tool_use') {
      const toolUseBlock = response.content.find(
        (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use',
      )

      if (!toolUseBlock) break

      const toolSpan = trace.span({
        name: `tool:${toolUseBlock.name}`,
        input: toolUseBlock.input,
      })

      const toolResult = await executeDiscogsToolCall(
        toolUseBlock.name,
        toolUseBlock.input as Record<string, unknown>,
      )

      toolSpan.end({ output: toolResult })

      messages.push({ role: 'assistant', content: response.content })
      messages.push({
        role: 'user',
        content: [
          {
            type: 'tool_result',
            tool_use_id: toolUseBlock.id,
            content: JSON.stringify(toolResult),
          },
        ],
      })

      response = await anthropic.messages.create({
        model: MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        tools: discogsTools,
        messages,
      })

      totalTokens += (response.usage?.input_tokens ?? 0) + (response.usage?.output_tokens ?? 0)
    }

    const textBlock = response.content.find(
      (block): block is Anthropic.TextBlock => block.type === 'text',
    )
    const result = textBlock?.text ?? 'No response generated.'

    generation.end({ output: result, usage: { totalTokens } })
    trace.update({ output: { response: result } })

    return result
  } catch (err) {
    error = err instanceof Error ? err.message : 'Unknown error'
    trace.update({ output: { error } })
    throw err
  } finally {
    const latencyMs = Date.now() - startTime

    emitTraceEvent({
      traceId: trace.id,
      userMessage: message,
      latencyMs,
      totalTokens,
      error,
      timestamp: new Date().toISOString(),
    })

    await langfuse.flushAsync()
  }
}
