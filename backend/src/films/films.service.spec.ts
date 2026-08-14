import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FilmsRepository } from './films.repository';
import { Film } from './films.schema';
import { FilmsService } from './films.service';

describe('FilmsService', () => {
  let service: FilmsService;
  let repository: jest.Mocked<FilmsRepository>;

  beforeEach(async () => {
    const repositoryMock = {
      findAll: jest.fn(),
      findScheduleByFilmId: jest.fn(),
      findSession: jest.fn(),
      reserveSeats: jest.fn(),
      releaseSeats: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        FilmsService,
        { provide: FilmsRepository, useValue: repositoryMock },
      ],
    }).compile();

    service = module.get(FilmsService);
    repository = module.get(FilmsRepository) as jest.Mocked<FilmsRepository>;
  });

  it('возвращает список фильмов без расписания', async () => {
    const film: Film = {
      id: '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf',
      rating: 8,
      director: 'Режиссёр',
      tags: ['Драма'],
      title: 'Фильм',
      about: 'Кратко',
      description: 'Подробно',
      image: '/poster.jpg',
      cover: '/cover.jpg',
      schedule: [],
    };
    repository.findAll.mockResolvedValue([film]);

    const result = await service.findAll();

    expect(result.total).toBe(1);
    expect(result.items[0]).not.toHaveProperty('schedule');
  });

  it('возвращает пустое расписание существующего фильма', async () => {
    repository.findScheduleByFilmId.mockResolvedValue([]);

    await expect(service.findSchedule('film-id')).resolves.toEqual({
      total: 0,
      items: [],
    });
  });

  it('возвращает 404 для отсутствующего фильма', async () => {
    repository.findScheduleByFilmId.mockResolvedValue(null);

    await expect(service.findSchedule('film-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
