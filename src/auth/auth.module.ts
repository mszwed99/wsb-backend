import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersService } from 'src/users/users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles, User } from 'src/users/entities';
import { JwtModule } from '@nestjs/jwt';
import { AtStrategy, RtStrategy } from './strategies';
import { Shop } from 'src/shops/entities/shop.entity';
import { Address } from 'src/addresses/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Roles, Address]),
    JwtModule.register({})
  ],
  controllers: [AuthController],
  providers: [AtStrategy, RtStrategy, AuthService, UsersService ]

})
export class AuthModule {}
