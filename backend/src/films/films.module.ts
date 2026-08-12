import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { FilmsController } from './films.controller';
import { FilmsRepository } from './films.repository';
import { Film, FilmSchema } from './films.schema';
import { FilmsService } from './films.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Film.name, schema: FilmSchema }]),
  ],
  controllers: [FilmsController],
  providers: [FilmsRepository, FilmsService],
  exports: [FilmsService],
})
export class FilmsModule {}
