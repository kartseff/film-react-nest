import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { ScheduleDto } from '../films/dto/schedule.dto';
import { FilmsService } from '../films/films.service';
import { CreateOrderDto, TicketDto } from './dto/create-order.dto';
import { OrderResultDto } from './dto/order-result.dto';

interface ReservationGroup {
  film: string;
  session: string;
  schedule: ScheduleDto;
  tickets: TicketDto[];
  places: string[];
}

@Injectable()
export class OrderService {
  constructor(private readonly filmsService: FilmsService) {}

  async createOrder(order: CreateOrderDto): Promise<OrderResultDto[]> {
    const groups = await this.prepareReservationGroups(order.tickets);
    const completedGroups: ReservationGroup[] = [];

    try {
      for (const group of groups) {
        const reserved = await this.filmsService.reserveSeats(
          group.film,
          group.session,
          group.places,
        );

        if (!reserved) {
          throw new BadRequestException(
            'Одно или несколько выбранных мест уже заняты',
          );
        }

        completedGroups.push(group);
      }
    } catch (error: unknown) {
      await this.rollbackReservations(completedGroups);
      throw error;
    }

    const scheduleBySession = new Map(
      groups.map((group) => [`${group.film}:${group.session}`, group.schedule]),
    );

    return order.tickets.map((ticket) => {
      const schedule = scheduleBySession.get(
        `${ticket.film}:${ticket.session}`,
      ) as ScheduleDto;

      return {
        id: randomUUID(),
        film: ticket.film,
        session: ticket.session,
        daytime: schedule.daytime,
        row: ticket.row,
        seat: ticket.seat,
        price: schedule.price,
      };
    });
  }

  private async prepareReservationGroups(
    tickets: TicketDto[],
  ): Promise<ReservationGroup[]> {
    const groupedTickets = new Map<string, TicketDto[]>();
    const uniqueTickets = new Set<string>();

    for (const ticket of tickets) {
      const ticketKey = `${ticket.film}:${ticket.session}:${ticket.row}:${ticket.seat}`;

      if (uniqueTickets.has(ticketKey)) {
        throw new BadRequestException(
          'Заказ содержит одинаковые места для одного сеанса',
        );
      }

      uniqueTickets.add(ticketKey);
      const sessionKey = `${ticket.film}:${ticket.session}`;
      const group = groupedTickets.get(sessionKey) ?? [];
      group.push(ticket);
      groupedTickets.set(sessionKey, group);
    }

    const groups: ReservationGroup[] = [];

    for (const ticketsInSession of groupedTickets.values()) {
      const firstTicket = ticketsInSession[0];
      const schedule = await this.filmsService.findSession(
        firstTicket.film,
        firstTicket.session,
      );

      if (!schedule) {
        throw new NotFoundException('Фильм или сеанс не найден');
      }

      for (const ticket of ticketsInSession) {
        this.validateTicket(ticket, schedule);
      }

      groups.push({
        film: firstTicket.film,
        session: firstTicket.session,
        schedule,
        tickets: ticketsInSession,
        places: ticketsInSession.map(
          (ticket) => `${ticket.row}:${ticket.seat}`,
        ),
      });
    }

    return groups;
  }

  private validateTicket(ticket: TicketDto, schedule: ScheduleDto): void {
    if (ticket.row > schedule.rows || ticket.seat > schedule.seats) {
      throw new BadRequestException('Выбранного места не существует');
    }

    if (ticket.daytime && ticket.daytime !== schedule.daytime) {
      throw new BadRequestException('Дата билета не соответствует сеансу');
    }

    if (ticket.price !== undefined && ticket.price !== schedule.price) {
      throw new BadRequestException('Цена билета не соответствует сеансу');
    }
  }

  private async rollbackReservations(
    groups: ReservationGroup[],
  ): Promise<void> {
    await Promise.all(
      groups.map((group) =>
        this.filmsService.releaseSeats(group.film, group.session, group.places),
      ),
    );
  }
}
