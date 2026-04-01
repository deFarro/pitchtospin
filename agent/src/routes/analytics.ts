import { FastifyInstance } from 'fastify'
import { getOverview, getLatencyHistogram } from '../services/analytics.js'

export async function analyticsRoutes(app: FastifyInstance) {
  app.get('/overview', async () => {
    return getOverview()
  })

  app.get('/latency-histogram', async () => {
    return getLatencyHistogram()
  })
}
