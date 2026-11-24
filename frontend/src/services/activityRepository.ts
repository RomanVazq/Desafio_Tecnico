import { http } from './api'
import type {
  Activity,
  ActivityFilters,
  ActivityPayload,
  ActivityUpdatePayload,
  ItemResponse,
  MessageResponse,
  PaginatedResponse,
} from '../types/activity'


export interface ActivityRepository {
  list(filters: ActivityFilters, page?: number): Promise<PaginatedResponse<Activity>>
  create(payload: ActivityPayload): Promise<Activity>
  update(id: number, payload: ActivityUpdatePayload): Promise<Activity>
  remove(id: number): Promise<string>
}

const RESOURCE = '/activities'

export const httpActivityRepository: ActivityRepository = {
  list(filters, page) {
    const { q, status, priority } = filters
    return http.get<PaginatedResponse<Activity>>(RESOURCE, {
      q: q || undefined,
      status: status || undefined,
      priority: priority || undefined,
      page: page && page > 1 ? page : undefined,
    })
  },

  async create(payload) {
    const response = await http.post<ItemResponse<Activity>>(RESOURCE, payload)
    return response.data
  },

  async update(id, payload) {
    const response = await http.patch<ItemResponse<Activity>>(`${RESOURCE}/${id}`, payload)
    return response.data
  },

  async remove(id) {
    const response = await http.delete<MessageResponse>(`${RESOURCE}/${id}`)
    return response.message
  },
}
