import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { AtGuard, RolesGuard } from 'src/common/guards';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { Role } from 'src/users/entities';

@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @UseGuards(AtGuard)
  addAddress(
    @GetCurrentUserId() userId: number,
    @Body() dto: CreateAddressDto
  ){
    return this.addressesService.addAddress(userId, dto)
  }

  @Get()
  @UseGuards(AtGuard)
  getAddress(
    @GetCurrentUserId() userId: number,
  ){
    return this.addressesService.getAddresses(userId)
  }

  @Delete(':id')
  @UseGuards(AtGuard)
  deleteAddress(
    @GetCurrentUserId() userId: number,
    @Param('id') addressId: number
  ){
    return this.addressesService.deleteAddress(userId, addressId)
  }
}
