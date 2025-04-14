export type LogLevel = 'info' | 'warn' | 'error' | 'debug'

export interface LogContext {
  timestamp: string
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  error?: Error
}

export class Logger {
  private static formatLog(context: LogContext): string {
    const { timestamp, level, message, context: extraContext, error } = context
    const logEntry = {
      timestamp,
      level,
      message,
      ...extraContext,
      ...(error && {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        }
      })
    }
    return JSON.stringify(logEntry)
  }

  static info(message: string, context?: Record<string, unknown>): void {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: 'info',
      message,
      context
    }
    console.log(this.formatLog(logContext))
  }

  static warn(message: string, context?: Record<string, unknown>): void {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: 'warn',
      message,
      context
    }
    console.warn(this.formatLog(logContext))
  }

  static error(message: string, error?: Error, context?: Record<string, unknown>): void {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: 'error',
      message,
      error,
      context
    }
    console.error(this.formatLog(logContext))
  }

  static debug(message: string, context?: Record<string, unknown>): void {
    const logContext: LogContext = {
      timestamp: new Date().toISOString(),
      level: 'debug',
      message,
      context
    }
    console.debug(this.formatLog(logContext))
  }
} 