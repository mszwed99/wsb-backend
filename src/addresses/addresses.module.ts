import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles, User } from 'src/users/entities';
import { Address } from './entities';
import { UsersService } from 'src/users/users.service';
import { Shop } from 'src/shops/entities';


@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles, Address, Shop])
  ],
  controllers: [AddressesController],
  providers: [AddressesService, UsersService]
})
export class AddressesModule {}
