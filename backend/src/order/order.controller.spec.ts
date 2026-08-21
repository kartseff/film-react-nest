import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';

describe('OrderController', () => {
  let controller: OrderController;
  let orderService: {
    createOrder: jest.MockedFunction<OrderService['createOrder']>;
  };

  beforeEach(() => {
    orderService = {
      createOrder: jest.fn<OrderService['createOrder']>(),
    };
    controller = new OrderController(orderService as unknown as OrderService);
  });

  it('передаёт заказ в OrderService и оборачивает билеты в ответ со счётчиком', async () => {
    const order = {
      email: 'viewer@example.com',
      phone: '+79990000000',
      tickets: [
        {
          film: 'd290f1ee-6c54-4b01-90e6-d701748f0851',
          session: 'f2e429b0-685d-41f8-a8cd-1d8cb63b99ce',
          row: 1,
          seat: 2,
        },
      ],
    };
    const tickets = [
      {
        id: '7f48b9da-fbb6-42ce-a199-1d14d6e9490a',
        film: order.tickets[0].film,
        session: order.tickets[0].session,
        daytime: '2024-06-28T10:00:53+03:00',
        row: 1,
        seat: 2,
        price: 350,
      },
    ];
    orderService.createOrder.mockResolvedValue(tickets);

    await expect(controller.createOrder(order)).resolves.toEqual({
      total: 1,
      items: tickets,
    });

    expect(orderService.createOrder).toHaveBeenCalledWith(order);
  });
});
