import { Controller, Get, Param } from '@nestjs/common';
import { FilmIdDto } from './dto/film-id.dto';
import { FilmsService } from './films.service';

@Controller('films')
export class FilmsController {
  constructor(private readonly filmsService: FilmsService) {}

  @Get()
  findAll() {
    return this.filmsService.findAll();
  }

  @Get(':id/schedule')
  findSchedule(@Param() params: FilmIdDto) {
    return this.filmsService.findSchedule(params.id);
  }
}
