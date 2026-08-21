import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { JsonLogger } from './json-logger.service';

describe('JsonLogger', () => {
  let logger: JsonLogger;

  beforeEach(() => {
    logger = new JsonLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('должен формировать валидную JSON-запись', () => {
    expect(logger.formatMessage('log', 'message', { context: 'test' })).toBe(
      JSON.stringify({
        level: 'log',
        message: 'message',
        optionalParams: [{ context: 'test' }],
      }),
    );
  });

  it('должен выводить log-запись через console.log', () => {
    const consoleSpy = jest
      .spyOn(console, 'log')
      .mockImplementation(() => undefined);

    logger.log('message', { context: 'test' });

    expect(consoleSpy).toHaveBeenCalledWith(
      logger.formatMessage('log', 'message', { context: 'test' }),
    );
  });

  it('должен выводить error-запись через console.error', () => {
    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    logger.error('message', 'trace');

    expect(consoleSpy).toHaveBeenCalledWith(
      logger.formatMessage('error', 'message', 'trace'),
    );
  });

  it('должен выводить warn-запись через console.warn', () => {
    const consoleSpy = jest
      .spyOn(console, 'warn')
      .mockImplementation(() => undefined);

    logger.warn('message');

    expect(consoleSpy).toHaveBeenCalledWith(
      logger.formatMessage('warn', 'message'),
    );
  });
});
