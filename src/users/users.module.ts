import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles, User } from './entities';
import { Address } from 'src/addresses/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles, Address])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersModule]
})
export class UsersModule {}
