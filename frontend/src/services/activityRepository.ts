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
  list(filters: ActivityFilters): Promise<PaginatedResponse<Activity>>
  find(id: number): Promise<Activity>
  create(payload: ActivityPayload): Promise<Activity>
  update(id: number, payload: ActivityUpdatePayload): Promise<Activity>
  remove(id: number): Promise<string>
}

const RESOURCE = '/activities'

export const httpActivityRepository: ActivityRepository = {
  list({ q, status }) {
    return http.get<PaginatedResponse<Activity>>(RESOURCE, {
      q: q || undefined,
      status: status || undefined,
    })
  },

  async find(id) {
    const response = await http.get<ItemResponse<Activity>>(`${RESOURCE}/${id}`)
    return response.data
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
