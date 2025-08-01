export class Logger {
  private static formatMessage(level: string, message: string, meta?: any): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
    return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
  }

  static info(message: string, meta?: any): void {
    console.log(this.formatMessage('info', message, meta));
  }

  static warn(message: string, meta?: any): void {
    console.warn(this.formatMessage('warn', message, meta));
  }

  static error(message: string, meta?: any): void {
    console.error(this.formatMessage('error', message, meta));
  }

  static debug(message: string, meta?: any): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  static log(level: string, message: string, meta?: any): void {
    switch (level.toLowerCase()) {
      case 'info':
        this.info(message, meta);
        break;
      case 'warn':
        this.warn(message, meta);
        break;
      case 'error':
        this.error(message, meta);
        break;
      case 'debug':
        this.debug(message, meta);
        break;
      default:
        this.info(message, meta);
    }
  }
} 