import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { FilmEntity } from './entities/film.entity';
import { ScheduleEntity } from './entities/schedule.entity';
import { FilmsRepository } from './films.repository';

@Injectable()
export class AppRepository implements FilmsRepository {
  constructor(
    @InjectRepository(FilmEntity)
    private readonly filmRepository: Repository<FilmEntity>,
    @InjectRepository(ScheduleEntity)
    private readonly scheduleRepository: Repository<ScheduleEntity>,
    private readonly dataSource: DataSource,
  ) {}

  findAll(): Promise<FilmEntity[]> {
    return this.filmRepository.find();
  }

  async findScheduleByFilmId(id: string): Promise<ScheduleEntity[] | null> {
    const film = await this.filmRepository.findOne({
      where: { id },
      relations: { schedule: true },
    });

    return film?.schedule ?? null;
  }

  findSession(
    filmId: string,
    sessionId: string,
  ): Promise<ScheduleEntity | null> {
    return this.scheduleRepository.findOne({
      where: { id: sessionId, filmId },
    });
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<boolean> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schedule = await queryRunner.manager
        .getRepository(ScheduleEntity)
        .createQueryBuilder('schedule')
        .setLock('pessimistic_write')
        .where('schedule.id = :sessionId', { sessionId })
        .andWhere('schedule.filmId = :filmId', { filmId })
        .getOne();

      if (!schedule || places.some((place) => schedule.taken.includes(place))) {
        await queryRunner.rollbackTransaction();
        return false;
      }

      schedule.taken = [...schedule.taken, ...places];
      await queryRunner.manager.save(schedule);
      await queryRunner.commitTransaction();
      return true;
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schedule = await queryRunner.manager
        .getRepository(ScheduleEntity)
        .createQueryBuilder('schedule')
        .setLock('pessimistic_write')
        .where('schedule.id = :sessionId', { sessionId })
        .andWhere('schedule.filmId = :filmId', { filmId })
        .getOne();

      if (schedule) {
        const releasedPlaces = new Set(places);
        schedule.taken = schedule.taken.filter(
          (place) => !releasedPlaces.has(place),
        );
        await queryRunner.manager.save(schedule);
      }

      await queryRunner.commitTransaction();
    } catch (error: unknown) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
