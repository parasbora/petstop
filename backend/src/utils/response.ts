import { CustomContext, ApiResponse } from '../types'
import { Logger } from './logger'

export const handleError = (c: CustomContext, error: unknown, message: string, status: number = 500): Response => {
  Logger.error(message, error as Error, { 
    status,
    path: c.req.path,
    method: c.req.method
  })
  const response: ApiResponse = { error: message }
  return c.json(response, status as any)
}

export const successResponse = <T>(c: CustomContext, data: T | undefined, message?: string): Response => {
  Logger.info(message || 'Request successful', {
    path: c.req.path,
    method: c.req.method,
    data: data ? 'present' : 'absent'
  })
  const response: ApiResponse<T> = { data, message }
  return c.json(response, 200)
} 