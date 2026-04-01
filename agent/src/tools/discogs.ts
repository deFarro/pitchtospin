import type { Tool } from '@anthropic-ai/sdk/resources/messages.js'

const DISCOGS_BASE = 'https://api.discogs.com'
const token = () => process.env.DISCOGS_TOKEN ?? ''
const headers = () => ({
  Authorization: `Discogs token=${token()}`,
  'User-Agent': 'PitchToSpin/0.1',
})

export const discogsTools: Tool[] = [
  {
    name: 'search_releases',
    description:
      'Search for music releases on Discogs. Returns titles, artists, labels, years, and formats.',
    input_schema: {
      type: 'object' as const,
      properties: {
        query: { type: 'string', description: 'Search query (artist, album, track, etc.)' },
        genre: { type: 'string', description: 'Filter by genre (e.g. Electronic, Rock, Jazz)' },
        year: { type: 'string', description: 'Filter by year or year range (e.g. 2020 or 1990-2000)' },
      },
      required: ['query'],
    },
  },
  {
    name: 'get_artist',
    description: 'Get detailed information about an artist from Discogs.',
    input_schema: {
      type: 'object' as const,
      properties: {
        artist_id: { type: 'number', description: 'Discogs artist ID' },
      },
      required: ['artist_id'],
    },
  },
  {
    name: 'get_release',
    description: 'Get detailed information about a specific release (album, single, etc.).',
    input_schema: {
      type: 'object' as const,
      properties: {
        release_id: { type: 'number', description: 'Discogs release ID' },
      },
      required: ['release_id'],
    },
  },
  {
    name: 'get_marketplace_listings',
    description:
      'Find marketplace listings for a release — shows prices, conditions, and sellers.',
    input_schema: {
      type: 'object' as const,
      properties: {
        release_id: { type: 'number', description: 'Discogs release ID' },
        sort: {
          type: 'string',
          description: 'Sort by: price, seller, condition',
          enum: ['price', 'seller', 'condition'],
        },
        sort_order: {
          type: 'string',
          description: 'Sort order',
          enum: ['asc', 'desc'],
        },
      },
      required: ['release_id'],
    },
  },
]

async function discogsGet(path: string, params?: Record<string, string>) {
  const url = new URL(`${DISCOGS_BASE}${path}`)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }

  const res = await fetch(url.toString(), { headers: headers() })
  if (!res.ok) {
    return { error: `Discogs API error: ${res.status} ${res.statusText}` }
  }
  return res.json()
}

export async function executeDiscogsToolCall(
  name: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  switch (name) {
    case 'search_releases': {
      const params: Record<string, string> = {
        q: String(input.query),
        type: 'release',
        per_page: '10',
      }
      if (input.genre) params.genre = String(input.genre)
      if (input.year) params.year = String(input.year)
      return discogsGet('/database/search', params)
    }

    case 'get_artist':
      return discogsGet(`/artists/${input.artist_id}`)

    case 'get_release':
      return discogsGet(`/releases/${input.release_id}`)

    case 'get_marketplace_listings': {
      const params: Record<string, string> = { per_page: '10' }
      if (input.sort) params.sort = String(input.sort)
      if (input.sort_order) params.sort_order = String(input.sort_order)
      return discogsGet(`/marketplace/listings/${input.release_id}`, params)
    }

    default:
      return { error: `Unknown tool: ${name}` }
  }
}
