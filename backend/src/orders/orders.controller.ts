import {
  Controller,
  Get,
  Param,
  Post,
  Body,
  ParseIntPipe,
  Query,
  UseGuards,
  UnauthorizedException,
  Patch,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser('userId') userId: number | undefined,
  ) {
    return this.ordersService.create(this.requireUserId(userId), createOrderDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMyOrders(@CurrentUser('userId') userId: number | undefined) {
    return this.ordersService.getUserOrders(this.requireUserId(userId));
  }

  // Route cụ thể phải để trước route động
  @Get('promo/check')
  async checkPromo(
    @Query('code') code: string,
    @Query('amount') amount: string,
  ) {
    return this.ordersService.previewPromo(code, Number(amount));
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number | undefined,
  ) {
    return this.ordersService.findOne(id, this.requireUserId(userId));
  }
  // Thêm vào trong OrdersController (orders.controller.ts)
  @UseGuards(JwtAuthGuard)
  @Patch(':id/cancel')
  async cancelOrder(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('userId') userId: number | undefined,
  ) {
    return this.ordersService.cancelOrder(id, this.requireUserId(userId));
}

  private requireUserId(userId: unknown): number {
    if (typeof userId !== 'number' || !Number.isInteger(userId) || userId < 1) {
      throw new UnauthorizedException('Không xác định được người dùng đăng nhập.');
    }

    return userId;
  }
}