import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { AddressesService } from 'src/addresses/addresses.service';
import { OrderPaginationOptions, PaginationResponse } from 'src/common/pagination';
import { ProductsService } from 'src/products/products.service';
import { ShopsService } from 'src/shops/shops.service';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { Item } from './entities';
import { Order, OrderStatus } from './entities/order.entity';
import { ShopStatus } from './entities/shopStatus.entity';
import * as PDFDocument from 'pdfkit'
import { generateInvoice } from './handlers/generatePDF/generateInvoice';

@Injectable()
export class OrdersService {

  constructor(
    private readonly usersService: UsersService,
    private readonly productsService: ProductsService,
    private readonly addressService: AddressesService,
    private readonly shopsSerivce: ShopsService,
    @InjectRepository(Order) private readonly orderRepository: Repository<Order>,
    @InjectRepository(Item) private readonly itemRepository: Repository<Item>,
    @InjectRepository(ShopStatus) private readonly shopStatusRepository: Repository<ShopStatus>
  ) { }


  async checkStatus(orderId: number) {
    let status: boolean = true
    const order = await this.orderRepository.findOneOrFail(orderId, {
      relations: ['shopStatuses']
    })
    for (const shopStatus of order.shopStatuses) {
      if (shopStatus.status === false) status = false
    }
    if (status) {
      order.status = OrderStatus.Confirmed
      await order.save()
    }

  }
  
  async confirm(userId: number, shopId: number, orderId: number) {
    const shop = await this.shopsSerivce.findById(shopId)
    if (shop.user.id !== userId) throw new ForbiddenException()

    const shopStatus = await this.shopStatusRepository.createQueryBuilder('shopStatus')
      .leftJoin('shopStatus.order', 'order')
      .addSelect(['order.id'])
      .leftJoin('shopStatus.shop', 'shop')
      .addSelect(['shop.id'])
      .where('order.id = :orderId and shop.id = :shopId', { orderId, shopId })
      .getOneOrFail()

    shopStatus.status = true
    await shopStatus.save()
    await this.checkStatus(orderId)
  }

  async cancel(orderId: number, userId: number): Promise<void> {
    const order = await this.findOne(orderId)
    if (order.user.id !== userId) throw new ForbiddenException()
    if (order.status !== OrderStatus.Pending) {
      throw new BadRequestException('This order cant be canceled')
    }
    order.status = OrderStatus.Canceled
    await order.save()
  }

  async complete(orderId: number): Promise<void> {
    const order = await this.findOne(orderId)
    if (order.status !== OrderStatus.Confirmed) {
      throw new BadRequestException('This order cant be completed')
    }
    order.status = OrderStatus.Complete
    await order.save()
  }



  async payment(orderId: number, userId: number): Promise<void> {
    const order = await this.orderRepository.createQueryBuilder('order')
      .where('order.id = :orderId', { orderId: orderId })
      .innerJoinAndSelect('order.user', 'user')
      .innerJoinAndSelect('order.items', 'item')
      .innerJoin('item.product', 'product')
      .addSelect('product.id')
      .getOne()

    if (order.user.id !== userId) throw new ForbiddenException()
    if (order.status !== OrderStatus.Pending) {
      throw new BadRequestException('This order cant be paid')
    }
    order.status = OrderStatus.Paid

    order.items.forEach(async item => {
      await this.productsService.decreaseAmount(item.product.id, item.amount)
    });

    await order.save()
  }

  async findOne(orderId: number): Promise<Order> {
    const order = await this.orderRepository.findOne(orderId).catch(err => {
      throw new NotFoundException()
    })
    if (!order) throw new NotFoundException()
    return order
  }

  async findOneOrder(orderId: number): Promise<Order> {
    let query = this.orderRepository.createQueryBuilder('order')
    .innerJoinAndSelect('order.address', 'address')
    .innerJoinAndSelect('order.user', 'user')
    .innerJoinAndSelect('order.items', 'item')
    .innerJoinAndSelect('item.shop', 'shop')
    .innerJoin('item.product', 'product')
    .addSelect('product.id')
    .where('order.id = :orderId', {orderId: orderId})

    const order = await query.getOneOrFail().catch(err => {
      throw new NotFoundException()
    })
    if (!order) throw new NotFoundException()

    return order
  }
  async findAllOrders(options: OrderPaginationOptions): Promise<PaginationResponse<Order>> {
    const { take, skip } = options
    let query = this.orderRepository.createQueryBuilder('order')
    .innerJoinAndSelect('order.address', 'address')
    .innerJoin('order.shops', 'shop')
    .innerJoinAndSelect('order.items', 'item')
    .innerJoin('item.product', 'product')
    .addSelect('product.id')
    .orderBy('order.created_at','DESC')
    .take(take || 10)
    .skip(skip|| 0)

    const [orders, total] = await query.getManyAndCount()
    return {
      total: total,
      data: orders
    }
  }

  async findUserOrders(userId: number, options: OrderPaginationOptions): Promise<PaginationResponse<Order>> {
    const { take, skip } = options
    let query = this.orderRepository.createQueryBuilder('order')
      .innerJoinAndSelect('order.address', 'address')
      .innerJoin('order.user', 'user')
      .where('user.id = :userId', { userId: userId })
      .innerJoinAndSelect('order.items', 'item')
      .innerJoin('item.shop', 'itemShop')
      .innerJoin('item.product', 'product')
      .addSelect('product.id')
      .orderBy('order.created_at','DESC')
      .take(take || 10)
      .skip(skip || 0)

    const [orders, total] = await query.getManyAndCount()
    return {
      total: total,
      data: orders
    }
  }

  async findShopOrders(userId: number, shopId: number, options: OrderPaginationOptions): Promise<PaginationResponse<Order>> {
    const shop = await this.shopsSerivce.findOne(shopId)
    if (shop.user.id !== userId) throw new ForbiddenException()
    const { take, skip } = options
    let query = this.orderRepository.createQueryBuilder('order')
      .innerJoinAndSelect('order.address', 'address')
      .innerJoin('order.shops', 'shop')
      .where('shop.id = :shopId', { shopId: shopId })
      .innerJoinAndSelect('order.items', 'item')
      .innerJoin('item.shop', 'itemShop')
      .innerJoin('item.product', 'product')
      .addSelect('product.id')
      .andWhere('itemShop.id = :shopId', { shopId: shopId })
      .andWhere('status != :status', { status: OrderStatus.Pending })
      .orderBy('order.created_at','DESC')
      .take(take || 10)
      .skip(skip || 0)

    const [orders, total] = await query.getManyAndCount()
    return {
      total: total,
      data: orders
    }
  }



  getTotalPrice(items: Item[]): number {
    let totalPrice = 0
    items.forEach(item => {
      totalPrice = totalPrice + item.price
    });
    return Math.round(totalPrice * 100 + Number.EPSILON) / 100
  }

  async create(userId: number, createOrderDto: CreateOrderDto) {
    const { nip, addressId, items } = createOrderDto
    const user = await this.usersService.findById(userId)
    const address = await this.addressService.findOne(addressId)
    let orderItems: Item[] = []
    let shopsQueryId: number[] = []


    // Valid if all products are avaible
    let orderValid: boolean = true
    for (const item of items) {
      let productValid: boolean = false
      const product = await this.productsService.findOne(item.productId).catch(err => { })
      if (product) {
        productValid = await this.productsService.checkAvailability(product.id, item.amount)
      }
      if (!productValid) orderValid = false
    }

    if (!orderValid) throw new BadRequestException('Order credentials are inncorrect')

    for (const item of items) {
      const product = await this.productsService.findOne(item.productId)
      shopsQueryId.push(product.shop.id)
      const shop = await this.shopsSerivce.findOne(product.shop.id)
      const orderItem = this.itemRepository.create({
        name: product.name,
        amount: item.amount,
        itemPrice: product.price,
        vat: product.vat,
        price: product.price * item.amount,
        product: product,
        shop: shop
      })
      const savedItem = await orderItem.save()
      orderItems.push(savedItem);
    }

    const shops = await this.shopsSerivce.findByIds(shopsQueryId)

    const order = await this.orderRepository.save({
      nip: nip,
      address: address,
      user: user,
      totalPrice: this.getTotalPrice(orderItems),
      items: orderItems,
      shops: shops
    })
    console.log(order.totalPrice);
    
    for (const shop of shops) {
      const shopStatus: ShopStatus = this.shopStatusRepository.create({
        shop: shop,
        order: order
      })
      await shopStatus.save()
    }
    return { id: order.id };
  }


  async raport(orderId: number): Promise<Buffer> {
    const order = await this.findOneOrder(orderId)

    

    const pdfBuffer: Buffer = await new Promise(resolve => {
      const doc = generateInvoice(order)

      // customize  PDF document


      const buffer = []
      doc.on('data', buffer.push.bind(buffer))
      doc.on('end', () => {
        const data = Buffer.concat(buffer)
        resolve(data)
      })
    })

    return pdfBuffer
  }
}
