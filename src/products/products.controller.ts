import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, ParseIntPipe, BadRequestException } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { AtGuard, RolesGuard } from 'src/common/guards';
import { Role } from 'src/users/entities';
import { GetCurrentUserId, Roles } from 'src/common/decorators';
import { ProductPaginationOptions } from 'src/common/pagination';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { saveImageToStorage } from './helpers/image-storage';
import { of } from 'rxjs';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }


  @Get('find/:id')
  findOne(@Param('id') productId: number) {
    return this.productsService.findOne(productId)
  }

  @Get(':productId/:amount')
  checkAvailability(
    @Param('productId') productId: number,
    @Param('amount', ParseIntPipe) amount: number
  ): Promise<boolean> {
    return this.productsService.checkAvailability(productId, amount)
  }


  @Get('find')
  findAll(
    @Query() options: ProductPaginationOptions) {
    return this.productsService.findAll(null, options);
  }

  @Get('find/shop/:shopId')
  findAllShop(
    @Param('shopId') shopId: number,
    @Query() options: ProductPaginationOptions) {
    return this.productsService.findAll(shopId, options);
  }

  @Get('/check')
  findByIds(
    @Query('productId') productIds: string[]
  ){
    return this.productsService.findByIds(productIds);
  }


  @Post('shop/:shopId')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Customer)
  addProduct(
    @Body() dto: CreateProductDto,
    @Param('shopId') shopId: number,
    @GetCurrentUserId() userId: number
  ): Promise<number> {
    return this.productsService.addProduct(dto, shopId, userId)
  }

  @Patch('shop/:shopId/:productId')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Customer)
  editProduct(
    @Body() dto: UpdateProductDto,
    @Param('productId') productId: number,
    @Param('shopId') shopId: number,
    @GetCurrentUserId() userId: number
  ) {
    return this.productsService.editProduct(dto, shopId, productId, userId)
  }


  @Delete('shop/:shopId/:productId')
  @UseGuards(AtGuard, RolesGuard)
  @Roles(Role.Customer)
  removeProduct(
    @Param('shopId') shopId: number,
    @Param('productId') productId: number,
    @GetCurrentUserId() userId: number
  ): any {
    return this.productsService.removeProduct(shopId, productId, userId)
  }


  @Post('image/:productId')
  @UseInterceptors(FileInterceptor('image', saveImageToStorage))
  setImage(
    @UploadedFile() image: Express.Multer.File,
    @Param('productId') productId: number
  ) {
    const fileName = image?.filename;
    if(!fileName) throw new BadRequestException('File must be a png, jpg or jpeg')
    return this.productsService.setImage(productId, fileName)
  }

}
