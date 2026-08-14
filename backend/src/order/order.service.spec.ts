import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { FilmsService } from '../films/films.service';
import { TicketDto } from './dto/create-order.dto';
import { OrderService } from './order.service';

describe('OrderService', () => {
  let service: OrderService;
  let filmsService: jest.Mocked<FilmsService>;

  const film = '0e33c7f6-27a7-4aa0-8e61-65d7e5effecf';
  const session = 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce';
  const daytime = '2024-06-28T10:00:53+03:00';
  const ticket: TicketDto = {
    film,
    session,
    daytime,
    row: 1,
    seat: 2,
    price: 350,
  };

  beforeEach(async () => {
    const filmsServiceMock = {
      findSession: jest.fn(),
      reserveSeats: jest.fn(),
      releaseSeats: jest.fn(),
    };
    const module = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: FilmsService, useValue: filmsServiceMock },
      ],
    }).compile();

    service = module.get(OrderService);
    filmsService = module.get(FilmsService) as jest.Mocked<FilmsService>;
    filmsService.findSession.mockResolvedValue({
      id: session,
      daytime,
      hall: 1,
      rows: 5,
      seats: 10,
      price: 350,
      taken: [],
    });
    filmsService.reserveSeats.mockResolvedValue(true);
    filmsService.releaseSeats.mockResolvedValue(undefined);
  });

  it('бронирует место и берёт данные сеанса с сервера', async () => {
    const result = await service.createOrder({ tickets: [ticket] });

    expect(filmsService.reserveSeats).toHaveBeenCalledWith(film, session, [
      '1:2',
    ]);
    expect(result[0]).toMatchObject({
      film,
      session,
      daytime,
      row: 1,
      seat: 2,
      price: 350,
    });
    expect(result[0].id).toEqual(expect.any(String));
  });

  it('отклоняет одинаковые места в одном заказе', async () => {
    await expect(
      service.createOrder({ tickets: [ticket, { ...ticket }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(filmsService.reserveSeats).not.toHaveBeenCalled();
  });

  it('отклоняет несуществующее место', async () => {
    await expect(
      service.createOrder({ tickets: [{ ...ticket, row: 6 }] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('возвращает конфликт, если место успели занять', async () => {
    filmsService.reserveSeats.mockResolvedValue(false);

    await expect(
      service.createOrder({ tickets: [ticket] }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('откатывает уже сохранённые группы при конфликте', async () => {
    const secondSession = '5beec101-acbb-4158-adc6-d855716b44a8';
    filmsService.findSession.mockResolvedValueOnce({
      id: session,
      daytime,
      hall: 1,
      rows: 5,
      seats: 10,
      price: 350,
      taken: [],
    });
    filmsService.findSession.mockResolvedValueOnce({
      id: secondSession,
      daytime,
      hall: 2,
      rows: 5,
      seats: 10,
      price: 350,
      taken: [],
    });
    filmsService.reserveSeats
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    await expect(
      service.createOrder({
        tickets: [ticket, { ...ticket, session: secondSession, seat: 3 }],
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
    expect(filmsService.releaseSeats).toHaveBeenCalledWith(film, session, [
      '1:2',
    ]);
  });
});
