import { IsUUID } from 'class-validator';

export class FilmIdDto {
  @IsUUID('4', { message: 'Некорректный идентификатор фильма' })
  id: string;
}
