import type { ErrorResponse } from '../types/activity.types'

const BASE_URL = (import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/api').replace(/\/$/, '')

export class ApiError extends Error {
  status: number
  errors: ErrorResponse['errors']

  constructor(message: string, status: number, errors?: ErrorResponse['errors']) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.errors = errors
  }
}

type QueryParams = Record<string, string | number | undefined>

interface RequestOptions {
  method?: string
  params?: QueryParams
  body?: unknown
}

function buildUrl(path: string, params?: QueryParams): string {
  const url = new URL(`${BASE_URL}${path}`)

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value))
    }
  })

  return url.toString()
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  if (options.body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response

  try {
    response = await fetch(buildUrl(path, options.params), {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    })
  } catch {
    throw new ApiError('No se pudo conectar con la API.', 0)
  }

  if (!response.ok) {
    let payload: ErrorResponse = { message: `Error ${response.status}` }

    try {
      payload = (await response.json()) as ErrorResponse
    } catch {
      payload = { message: 'No se pudo leer la respuesta del servidor.' }
    }

    throw new ApiError(payload.message, response.status, payload.errors)
  }

  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

export const http = {
  get<T>(path: string, params?: QueryParams): Promise<T> {
    return request<T>(path, { params })
  },

  post<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'POST', body })
  },

  patch<T>(path: string, body: unknown): Promise<T> {
    return request<T>(path, { method: 'PATCH', body })
  },

  delete<T>(path: string): Promise<T> {
    return request<T>(path, { method: 'DELETE' })
  },
}
