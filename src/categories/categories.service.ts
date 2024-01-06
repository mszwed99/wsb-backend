import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Category } from './entities';
@Injectable()
export class CategoriesService {
  constructor(
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ) {}


  async findByIds(ids: string[]) {
    const categories = await this.categoryRepository.createQueryBuilder("category")
      .where("category.id IN (:...ids)", {ids}).getMany().catch(err => {
        throw new NotFoundException();
      });
    return categories
  }

  async findAll() {
    const categories = await this.categoryRepository.find() 
    if (!categories) throw new NotFoundException()
    return categories;
  }

  async add(dto: CreateCategoryDto) {
    const category = await this.categoryRepository.create({
        name: dto.name
    })
    await this.categoryRepository.save(category).catch((error) => {
      if(error.code === '23505') {
        throw new ConflictException('Category with the given name already exists')
      } else {
        throw new InternalServerErrorException();
      }
    })
  }

  async rename(id: number, dto: UpdateCategoryDto) {
    const category = await this.categoryRepository.findOne(id).catch(err => {
      throw new NotFoundException()
    })

    category.name = dto.name
    category.save();
  }

  async remove(id: number) {
    const category = await this.categoryRepository.findOne(id)
    if (!category) throw new NotFoundException()
    category.remove()
  }
}
