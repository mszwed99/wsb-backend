import { Controller, Post, Body, UseGuards, Get, Query, Patch, Param, Res, StreamableFile, Header } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { AtGuard, RolesGuard } from 'src/common/guards';
import { OrderPaginationOptions, PaginationResponse } from 'src/common/pagination';
import { Order } from './entities';
import { Role } from 'src/users/entities';
import { Response } from 'express';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @UseGuards(AtGuard)
  create(
    @GetCurrentUserId() userId: number,
    @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(userId, createOrderDto);
  }

  @Post('payment/:orderId')
  @UseGuards(AtGuard)
  payment(
    @GetCurrentUserId() userId: number,
    @Param('orderId') orderId: number,
  ): Promise<void> {
    return this.ordersService.payment(orderId, userId)
  }

  @Post('cancel/:orderId')
  @UseGuards(AtGuard)
  cancel(
    @GetCurrentUserId() userId: number,
    @Param('orderId') orderId: number,
  ): Promise<void> {
    return this.ordersService.cancel(orderId, userId)
  }


  @Get('/findall')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Admin)
  findAllOrders(
    @Query() options: OrderPaginationOptions
  ): Promise<PaginationResponse<Order>> {
    return this.ordersService.findAllOrders(options);
  }


  @Get()
  @UseGuards(AtGuard)
  findUserOrders(
    @GetCurrentUserId() userId: number,
    @Query() options: OrderPaginationOptions
  ): Promise<PaginationResponse<Order>> {
    return this.ordersService.findUserOrders(userId, options);
  }

  @Get('/shop/:shopId')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Seller)
  findShopOrders(
    @GetCurrentUserId() userId: number,
    @Param('shopId') shopId: number,
    @Query() options: OrderPaginationOptions
  ): Promise<PaginationResponse<Order>> {
    return this.ordersService.findShopOrders(userId, shopId, options);
  }


  @Get(':orderId')
  @UseGuards(AtGuard)
  findOne(
    @Param('orderId') orderId: number,
  ): Promise<Order> {
    return this,this.ordersService.findOneOrder(orderId)
  }

  @Post('/confirm/:shopId/:orderId')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Seller)
  confirm(
    @GetCurrentUserId() userId: number,
    @Param('shopId') shopId: number,
    @Param('orderId') orderId: number,
  ){
    return this.ordersService.confirm(userId, shopId, orderId);
  }

  
  @Post('/complete/:orderId')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Admin)
  complete(
    @Param('orderId') orderId: number,
  ){
    return this.ordersService.complete(orderId);
  }


  @Get('/raport/:orderId')
  @Header('Content-type', 'application/pdf')
  //@UseGuards(AtGuard)
  async raport(
    @Param('orderId') orderId: number,
  ){
    const file = await this.ordersService.raport(orderId);
    return new StreamableFile(file)
  }

}
