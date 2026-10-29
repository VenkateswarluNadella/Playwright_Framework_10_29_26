export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
}

/** Writes structured console logs and retains entries for Cucumber attachments. */
class Logger {
  private readonly entries: LogEntry[] = [];

  debug(message: string, context?: Record<string, unknown>): void {
    this.write('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.write('warn', message, context);
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.write('error', message, context);
  }

  /** Returns captured log entries as newline-delimited JSON. */
  snapshot(): string {
    return this.entries.map((entry) => JSON.stringify(entry)).join('\n');
  }

  /** Clears entries at the beginning of a new scenario. */
  clear(): void {
    this.entries.length = 0;
  }

  private write(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const entry: LogEntry = { timestamp: new Date().toISOString(), level, message, context };
    this.entries.push(entry);
    const output = JSON.stringify(entry);
    if (level === 'error') console.error(output);
    else if (level === 'warn') console.warn(output);
    else console.log(output);
  }
}

export const logger = new Logger();
