import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { TskvLogger } from './tskv-logger.service';

describe('TskvLogger', () => {
  let logger: TskvLogger;

  beforeEach(() => {
    logger = new TskvLogger();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('должен формировать плоскую TSKV-запись', () => {
    expect(logger.formatMessage('log', 'message', { context: 'test' })).toBe(
      'level=log\tmessage=message\tcontext=test\n',
    );
  });

  it('должен экранировать служебные символы', () => {
    expect(logger.formatMessage('log', 'line\tone\nline')).toBe(
      'level=log\tmessage=line\\tone\\nline\n',
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
