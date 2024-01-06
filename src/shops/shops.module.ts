import { Module } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { ShopsController } from './shops.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Roles } from 'src/users/entities/role.entity';
import { Shop } from 'src/shops/entities/shop.entity';
import { Product } from 'src/products/entities';
import { Address } from 'src/addresses/entities';
import { HttpModule } from '@nestjs/axios';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles, Address, Shop, Product]),
    HttpModule
  ],
  controllers: [ShopsController],
  providers: [ShopsService, UsersService],
  exports: [ShopsModule, HttpModule]
})
export class ShopsModule {}
