import { FilmEntity } from './entities/film.entity';
import { ScheduleEntity } from './entities/schedule.entity';

export abstract class FilmsRepository {
  abstract findAll(): Promise<FilmEntity[]>;

  abstract findScheduleByFilmId(id: string): Promise<ScheduleEntity[] | null>;

  abstract findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleEntity | null>;

  abstract reserveSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<boolean>;

  abstract releaseSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<void>;
}
