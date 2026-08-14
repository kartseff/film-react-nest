import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Film, FilmDocument, FilmSchedule } from './films.schema';

@Injectable()
export class FilmsRepository {
  constructor(
    @InjectModel(Film.name)
    private readonly filmModel: Model<FilmDocument>,
  ) {}

  findAll(): Promise<Film[]> {
    return this.filmModel.find().lean<Film[]>().exec();
  }

  async findScheduleByFilmId(id: string): Promise<FilmSchedule[] | null> {
    const film = await this.filmModel
      .findOne({ id })
      .select({ schedule: 1, _id: 0 })
      .lean<Pick<Film, 'schedule'>>()
      .exec();

    return film?.schedule ?? null;
  }

  async findSession(
    filmId: string,
    sessionId: string,
  ): Promise<FilmSchedule | null> {
    const film = await this.filmModel
      .findOne({ id: filmId, 'schedule.id': sessionId })
      .select({ schedule: { $elemMatch: { id: sessionId } }, _id: 0 })
      .lean<Pick<Film, 'schedule'>>()
      .exec();

    return film?.schedule[0] ?? null;
  }

  async reserveSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<boolean> {
    const result = await this.filmModel.updateOne(
      {
        id: filmId,
        schedule: {
          $elemMatch: {
            id: sessionId,
            taken: { $nin: places },
          },
        },
      },
      {
        $addToSet: {
          'schedule.$.taken': { $each: places },
        },
      },
    );

    return result.modifiedCount === 1;
  }

  async releaseSeats(
    filmId: string,
    sessionId: string,
    places: string[],
  ): Promise<void> {
    await this.filmModel.updateOne(
      { id: filmId, 'schedule.id': sessionId },
      {
        $pull: {
          'schedule.$.taken': { $in: places },
        },
      },
    );
  }
}
