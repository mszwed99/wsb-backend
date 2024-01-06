import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Roles, User } from 'src/users/entities';
import { ShopsService } from 'src/shops/shops.service';
import { UsersService } from 'src/users/users.service';
import { Address } from 'src/addresses/entities';
import { Category } from 'src/categories/entities';
import { CategoriesService } from 'src/categories/categories.service';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles, Address, Shop, Product, Category]),
    HttpModule
  ],
  controllers: [ProductsController],
  providers: [ProductsService, ShopsService, UsersService, CategoriesService],
  exports: [ProductsModule]
})
export class ProductsModule {}
