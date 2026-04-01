import { FastifyInstance } from 'fastify'
import { handleChat } from '../services/chat.js'

interface ChatBody {
  message: string
  history: { role: 'user' | 'assistant'; content: string }[]
}

export async function agentRoutes(app: FastifyInstance) {
  app.post<{ Body: ChatBody }>('/chat', async (request, reply) => {
    const { message, history } = request.body

    if (!message?.trim()) {
      return reply.status(400).send({ error: 'Message is required' })
    }

    try {
      const response = await handleChat(message, history)
      return { response }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'An unexpected error occurred'

      if (message.includes('credit balance is too low')) {
        return reply
          .status(503)
          .send({ error: 'LLM service unavailable — check Anthropic billing.' })
      }

      request.log.error(err)
      return reply.status(500).send({ error: message })
    }
  })
}
