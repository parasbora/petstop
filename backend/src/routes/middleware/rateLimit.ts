import { Logger } from '../../utils/logger'

// Rate limiting store
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()
const signupAttempts = new Map<string, { count: number; lastAttempt: number }>()

// Helper function for rate limiting
const checkRateLimit = (ip: string | null, attempts: Map<string, { count: number; lastAttempt: number }>, maxAttempts: number = 5, windowMinutes: number = 15): boolean => {
  const ipAddress = ip || 'unknown'
  const now = Date.now()
  const attempt = attempts.get(ipAddress)
  
  if (!attempt) {
    attempts.set(ipAddress, { count: 1, lastAttempt: now })
    return true
  }

  if (now - attempt.lastAttempt > windowMinutes * 60 * 1000) {
    attempts.set(ipAddress, { count: 1, lastAttempt: now })
    return true
  }

  if (attempt.count >= maxAttempts) {
    Logger.warn('Rate limit exceeded', { ip: ipAddress, attempts: attempt.count })
    return false
  }

  attempts.set(ipAddress, { count: attempt.count + 1, lastAttempt: now })
  return true
}

export const rateLimitMiddleware = (type: 'login' | 'signup') => {
  return async (c: any, next: Function) => {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown'
    const attempts = type === 'login' ? loginAttempts : signupAttempts

    if (!checkRateLimit(ip, attempts)) {
      return c.json({ error: "Too many attempts. Please try again later." }, 429)
    }

    await next()
  }
}

// Helper function to reset rate limiter (for testing)
export const resetRateLimit = (ip: string) => {
  loginAttempts.delete(ip)
  signupAttempts.delete(ip)
  Logger.info('Rate limiter reset', { ip })
} 