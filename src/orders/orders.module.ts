import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { UsersService } from 'src/users/users.service';
import { Roles, User } from 'src/users/entities';
import { Address } from 'src/addresses/entities';
import { Shop } from 'src/shops/entities';
import { Product } from 'src/products/entities';
import { Category } from 'src/categories/entities';
import { ShopsService } from 'src/shops/shops.service';
import { ProductsService } from 'src/products/products.service';
import { CategoriesService } from 'src/categories/categories.service';
import { ShopsModule } from 'src/shops/shops.module';
import { AddressesService } from 'src/addresses/addresses.service';
import { Item } from './entities';
import { ShopStatus } from './entities/shopStatus.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles, Address, Shop, Product, Category, Order, Item, ShopStatus]),
    ShopsModule
  ],
  controllers: [OrdersController],
  providers: [OrdersService, UsersService, ProductsService, ShopsService, CategoriesService, AddressesService],
  exports: [OrdersModule]
})
export class OrdersModule {}
