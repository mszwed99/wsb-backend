import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto } from './dto/create-shop.dto';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { AtGuard, RolesGuard } from 'src/common/guards';
import { Role } from 'src/users/entities';
import { ShopPaginationOptions } from 'src/common/pagination';


@Controller('shops')
export class ShopsController {
  constructor(
    private readonly shopsService: ShopsService,
  ) {}


  @Post()
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Customer)
  create(
    @Body() dto: CreateShopDto,
    @GetCurrentUserId() userId: number
  ) {
    return this.shopsService.create(dto, userId);
  }

  @Delete(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Seller)
  remove(@Param('id') shopId: number, @GetCurrentUserId() userId: number) {
    return this.shopsService.remove(userId, shopId);
  }

  @Get()
  findAll(@Query() options: ShopPaginationOptions) {
    return this.shopsService.findAll(options);
  }
  @Get('company')
  async getCompany(@Query() query: { nip: string })  {
        return this.shopsService.getCompany(query.nip);
  }

  @UseGuards(AtGuard, RolesGuard)
  //@Roles(Role.Admin)
  @Get('inactive')
  findInActive(@Query() options: ShopPaginationOptions) {
    return this.shopsService.findInActive(options);
  } 
  
  @UseGuards(AtGuard, RolesGuard)
  //@Roles(Role.Admin)
  @Get('active')
  findActive(@Query() options: ShopPaginationOptions) {
    return this.shopsService.findActive(options);
  }

  @Patch('status/:id')
  @UseGuards(AtGuard, RolesGuard)
  // @Roles(Role.Admin)
  changeStatus(
    @Param('id') shopId: number
  ) {
    return this.shopsService.changeStatus(shopId);
  }

  @Get(':id')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Customer)
  findOne(@Param('id') shopId: number, @GetCurrentUserId() userId: number) {
    return this.shopsService.findOne(shopId);
  }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
  //   return this.shopsService.update(+id, updateShopDto);
  // }
 
}
