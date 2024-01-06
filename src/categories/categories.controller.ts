import { Controller, Post, Body, Param, Delete, UseGuards, Get, Patch } from '@nestjs/common';
import { AtGuard, RolesGuard } from 'src/common/guards';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';


@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  @UseGuards(AtGuard, RolesGuard)
  //@Roles(Role.Admin)
  add(@Body() dto: CreateCategoryDto) {
    return this.categoriesService.add(dto);
  }

  @Patch(':id')
  @UseGuards(AtGuard, RolesGuard)
  //@Roles(Role.Admin)
  rename(
    @Body() dto: UpdateCategoryDto,
    @Param('id') id: number)
  {
    return this.categoriesService.rename(id, dto);
  }


  @Delete(':id')
  @UseGuards(AtGuard, RolesGuard)
 // @Roles(Role.Admin)
  remove(@Param('id') id: number) {
    return this.categoriesService.remove(id);
  }
}
