import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { FilmEntity } from '../films/entities/film.entity';
import { ScheduleEntity } from '../films/entities/schedule.entity';

@Global()
@Module({})
export class DatabaseModule {
  static forRoot(): DynamicModule {
    return {
      module: DatabaseModule,
      imports: [
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService): TypeOrmModuleOptions => ({
            type: configService.getOrThrow<'postgres'>('database.driver'),
            url: configService.getOrThrow<string>('database.url'),
            username: configService.getOrThrow<string>('database.username'),
            password: configService.getOrThrow<string>('database.password'),
            entities: [FilmEntity, ScheduleEntity],
            synchronize: false,
          }),
        }),
      ],
    };
  }
}
