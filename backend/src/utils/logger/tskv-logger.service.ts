import { Injectable, LoggerService } from '@nestjs/common';

type TskvLogLevel = 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal';

@Injectable()
export class TskvLogger implements LoggerService {
  formatMessage(
    level: TskvLogLevel,
    message: unknown,
    ...optionalParams: unknown[]
  ): string {
    const fields = [
      `level=${this.escapeValue(level)}`,
      `message=${this.escapeValue(message)}`,
    ];

    optionalParams.forEach((param, index) => {
      if (this.isPlainObject(param)) {
        Object.entries(param).forEach(([key, value]) => {
          fields.push(`${this.escapeKey(key)}=${this.escapeValue(value)}`);
        });
        return;
      }

      fields.push(`param_${index + 1}=${this.escapeValue(param)}`);
    });

    return `${fields.join('\t')}\n`;
  }

  log(message: unknown, ...optionalParams: unknown[]): void {
    console.log(this.formatMessage('log', message, ...optionalParams));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    console.error(this.formatMessage('error', message, ...optionalParams));
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    console.warn(this.formatMessage('warn', message, ...optionalParams));
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    console.debug(this.formatMessage('debug', message, ...optionalParams));
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    console.log(this.formatMessage('verbose', message, ...optionalParams));
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    console.error(this.formatMessage('fatal', message, ...optionalParams));
  }

  private isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  private escapeKey(key: string): string {
    return this.escapeString(key).replace(/=/g, '\\=');
  }

  private escapeValue(value: unknown): string {
    if (typeof value === 'object' && value !== null) {
      try {
        return this.escapeString(JSON.stringify(value) ?? String(value));
      } catch {
        return this.escapeString(String(value));
      }
    }

    return this.escapeString(String(value));
  }

  private escapeString(value: string): string {
    return value
      .replace(/\\/g, '\\\\')
      .replace(/\t/g, '\\t')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r');
  }
}
