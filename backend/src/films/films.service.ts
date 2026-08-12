import { Injectable, NotFoundException } from '@nestjs/common';
import { ListResponseDto } from '../common/dto/list-response.dto';
import { FilmDto } from './dto/film.dto';
import { ScheduleDto } from './dto/schedule.dto';
import { FilmsMapper } from './films.mapper';
import { FilmsRepository } from './films.repository';

@Injectable()
export class FilmsService {
  constructor(private readonly filmsRepository: FilmsRepository) {}

  async findAll(): Promise<ListResponseDto<FilmDto>> {
    const films = await this.filmsRepository.findAll();
    return new ListResponseDto(films.map(FilmsMapper.toFilmDto));
  }

  async findSchedule(id: string): Promise<ListResponseDto<ScheduleDto>> {
    const schedule = await this.filmsRepository.findScheduleByFilmId(id);

    if (schedule === null) {
      throw new NotFoundException('Фильм не найден');
    }

    return new ListResponseDto(schedule.map(FilmsMapper.toScheduleDto));
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleDto | null> {
    const session = await this.filmsRepository.findSession(filmId, sessionId);
    return session ? FilmsMapper.toScheduleDto(session) : null;
  }

  reserveSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<boolean> {
    return this.filmsRepository.reserveSeats(filmId, sessionId, places);
  }

  releaseSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<void> {
    return this.filmsRepository.releaseSeats(filmId, sessionId, places);
  }
}
