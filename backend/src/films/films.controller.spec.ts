import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

describe('FilmsController', () => {
  let controller: FilmsController;
  let filmsService: {
    findAll: jest.MockedFunction<FilmsService['findAll']>;
    findSchedule: jest.MockedFunction<FilmsService['findSchedule']>;
  };

  beforeEach(() => {
    filmsService = {
      findAll: jest.fn<FilmsService['findAll']>(),
      findSchedule: jest.fn<FilmsService['findSchedule']>(),
    };
    controller = new FilmsController(filmsService as unknown as FilmsService);
  });

  it('передаёт получение списка фильмов в FilmsService', async () => {
    const response = { total: 0, items: [] };
    filmsService.findAll.mockResolvedValue(response);

    await expect(controller.findAll()).resolves.toBe(response);

    expect(filmsService.findAll).toHaveBeenCalledTimes(1);
  });

  it('передаёт идентификатор фильма при получении расписания', async () => {
    const id = 'd290f1ee-6c54-4b01-90e6-d701748f0851';
    const response = { total: 0, items: [] };
    filmsService.findSchedule.mockResolvedValue(response);

    await expect(controller.findSchedule({ id })).resolves.toBe(response);

    expect(filmsService.findSchedule).toHaveBeenCalledWith(id);
  });
});
