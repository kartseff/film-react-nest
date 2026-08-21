import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

export class TicketDto {
  @IsUUID('4', { message: 'Некорректный идентификатор фильма' })
  film!: string;

  @IsUUID('4', { message: 'Некорректный идентификатор сеанса' })
  session!: string;

  @IsOptional()
  @IsDateString({}, { message: 'Некорректная дата сеанса' })
  daytime?: string;

  @Type(() => Number)
  @IsInt({ message: 'Номер ряда должен быть целым числом' })
  @Min(1, { message: 'Номер ряда должен быть больше нуля' })
  row!: number;

  @Type(() => Number)
  @IsInt({ message: 'Номер места должен быть целым числом' })
  @Min(1, { message: 'Номер места должен быть больше нуля' })
  seat!: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'Цена должна быть числом' })
  @Min(0, { message: 'Цена не может быть отрицательной' })
  price?: number;
}

export class CreateOrderDto {
  @IsOptional()
  @IsEmail({}, { message: 'Некорректный адрес электронной почты' })
  email?: string;

  @IsOptional()
  @IsString({ message: 'Телефон должен быть строкой' })
  phone?: string;

  @IsArray({ message: 'Билеты должны быть массивом' })
  @ArrayNotEmpty({ message: 'Добавьте хотя бы один билет' })
  @ValidateNested({ each: true })
  @Type(() => TicketDto)
  tickets!: TicketDto[];
}
