import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ClassSerializerInterceptor } from '@nestjs/common';
import { UsersService } from './users.service';
import { Query } from '@nestjs/common';
import { AtGuard, RolesGuard } from 'src/common/guards';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { Role } from './entities';
import { UserPaginationOptions } from 'src/common/pagination';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

 
  @Get('info')
  @UseGuards(AtGuard)
  userInfo(
    @GetCurrentUserId() userId: number,
  ){
    return this.usersService.findOneWitchRelations(userId, ['roles'])
  }

  @Get('shops')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Seller)
  userShops(
    @GetCurrentUserId() userId: number,
  ){
    return this.usersService.findShops(userId)
  }

  @Get()
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Admin)
  findAll(@Query() options: UserPaginationOptions) {
    return this.usersService.findAll(options);
  }

}
