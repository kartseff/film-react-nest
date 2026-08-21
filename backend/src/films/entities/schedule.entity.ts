import { Column, Entity, JoinColumn, ManyToOne, PrimaryColumn } from 'typeorm';
import { FilmEntity } from './film.entity';
import { stringArrayTransformer } from './string-array.transformer';

@Entity('schedules')
export class ScheduleEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column('varchar')
  daytime!: string;

  @Column('integer')
  hall!: number;

  @Column('integer')
  rows!: number;

  @Column('integer')
  seats!: number;

  @Column('double precision')
  price!: number;

  @Column('text', { transformer: stringArrayTransformer })
  taken!: string[];

  @Column('uuid')
  filmId!: string;

  @ManyToOne(() => FilmEntity, (film) => film.schedule)
  @JoinColumn({ name: 'filmId' })
  film!: FilmEntity;
}
