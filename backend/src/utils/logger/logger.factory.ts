import { LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DevLogger } from './dev-logger.service';
import { JsonLogger } from './json-logger.service';
import { TskvLogger } from './tskv-logger.service';

export type LoggerType = 'DEV' | 'JSON' | 'TSKV';

export function createLogger(configService: ConfigService): LoggerService {
  const configuredType = (configService.get<string>('LOGGER') ?? 'DEV')
    .trim()
    .toUpperCase();
  const loggerType: LoggerType =
    configuredType === 'JSON' || configuredType === 'TSKV'
      ? configuredType
      : 'DEV';

  switch (loggerType) {
    case 'JSON':
      return new JsonLogger();
    case 'TSKV':
      return new TskvLogger();
    case 'DEV':
    default:
      return new DevLogger();
  }
}
