import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ListResponseDto } from '../common/dto/list-response.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderResultDto } from './dto/order-result.dto';
import { OrderService } from './order.service';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async createOrder(
    @Body() order: CreateOrderDto,
  ): Promise<ListResponseDto<OrderResultDto>> {
    const tickets = await this.orderService.createOrder(order);
    return new ListResponseDto(tickets);
  }
}
