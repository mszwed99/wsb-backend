import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoriesService } from 'src/categories/categories.service';
import { PaginationResponse, ProductPaginationOptions } from 'src/common/pagination';
import { ShopsService } from 'src/shops/shops.service';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities';

@Injectable()
export class ProductsService {
  constructor(
    private readonly shopsService: ShopsService,
    private readonly categoriesService: CategoriesService,
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
  ) { }



    
  async decreaseAmount(productId: number, amount: number): Promise<void> {
    const product = await this.findOne(productId)
    product.amount = product.amount - amount
    product.save()
  }

  async findByIds(productIds: string[]) {
    let products = await this.productRepository.findByIds(productIds).catch(err => { })
    return products
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.createQueryBuilder('product')
      .where('product.id = :id', { id: id })
      .innerJoin('product.shop', 'shop')
      .addSelect(['shop.id', 'shop.name', 'shop.user'])
      .innerJoinAndSelect('product.categories', 'categories')
      .innerJoin('shop.user', 'user')
      .addSelect(['user.id'])
      .getOneOrFail().catch(err => {
        throw new NotFoundException()
      })
    if (!product) {
      throw new NotFoundException()
    }

    return product
  }

  async checkAvailability(productId: number, amount: number) {
    const product: Product = await this.findOne(productId)

    if (product.amount < amount) {
      return false
    }

    return true
  }


  async findAll(shopId: number, options: ProductPaginationOptions): Promise<PaginationResponse<Product>> {

    const { take, skip, categoryID, name, max, min } = options
    let products: PaginationResponse<Product>

    if (categoryID) {
      products = await this.findProductsWithCategory(shopId, categoryID, name, max, min, take, skip)
    } else {
      products = await this.findProductsAndCount(shopId, take, skip, max, min, name)
    }

    return {
      total: products.total,
      data: products.data
    }
  }

  async addProduct(dto: CreateProductDto, shopId: number, userId: number) {
    let categories = []
    if (dto.categories.length > 0) {
      categories = await this.categoriesService.findByIds(dto.categories)
    }

    const product = await this.productRepository.create({
      name: dto.name,
      price: dto.price,
      vat: dto.vat,
      description: dto.description,
      amount: dto.amount,
      categories
    })

    const shop = await this.shopsService.findOneWitchRelations(shopId, ['user', 'products'])
    if (shop.user.id !== userId) throw new ForbiddenException()

    const productExist = shop.products.filter(p => p.name === product.name)
    if (productExist.length) {
      throw new ConflictException('Product already exists in current shop')
    }

    const productResult = await this.productRepository.save(product).catch(error => {
      throw new InternalServerErrorException();
    })

    shop.products = [...shop.products, productResult]
    await shop.save()
    return productResult.id
  }

  async removeProduct(shopId: number, productId: number, userId: number) {
    const shop = await this.shopsService.findOneWitchRelations(shopId, ['user', 'products'])
    const product = await this.productRepository.findOneOrFail(productId).catch(error => {
      throw new NotFoundException();
    })

    if (shop.user.id !== userId) throw new ForbiddenException()

    if (!(shop.products.find(p => p.id === productId))) throw new NotFoundException()
    const products = shop.products.filter(p => p.id !== productId)
    shop.products = products
    shop.save
    product.remove()

  }


  async editProduct(dto: UpdateProductDto, shopId: number, productId: number, userId: number) {
    const shop = await this.shopsService.findOneWitchRelations(shopId, ['user', 'products'])

    if (shop.user.id !== userId) throw new ForbiddenException()

    let product = await this.findOne(productId)
    const exist = shop.products.filter(e => e.id === product.id)
    if (!exist.length) throw new NotFoundException()

    product = Object.assign(product, dto)
    await product.save()
  }

  async setImage(productId: number, fileName: string) {
    const product = await this.findOne(productId)
    product.imgPath = fileName
    await product.save()
  }

  async findProductsAndCount(shopId: number, take: number, skip: number, max: number, min: number, name: string): Promise<PaginationResponse<Product>> {
    let query = this.productRepository.createQueryBuilder('product')
      .innerJoin('product.shop', 'shop')
      .addSelect(['shop.id', 'shop.name', 'shop.user'])
      .innerJoinAndSelect('product.categories', 'categories')
      .innerJoin('shop.user', 'user')
      .addSelect(['user.id'])
      .take(take || 10)
      .skip(skip || 0)

    if (shopId) {
      const shop = await this.shopsService.findById(shopId)
      if (!shop) throw new NotFoundException()
      query.andWhere('shop.id = :shopId', { shopId: shopId })
    }

    if (name) {
      query.andWhere("product.name ilike :name", { name: `%${name}%` })
    }
    if (max && min) {
      query.andWhere('product.price >= :min AND product.price <= :max', { min, max })
    }
    if (max && !min) {
      query.andWhere('product.price <= :max', { max })
    }
    if (!max && min) {
      query.andWhere('product.price >= :min', { min })
    }

    let [products, total] = await query.getManyAndCount()


    return {
      total: total,
      data: products
    }
  }


  async findProductsWithCategory(shopId: number, categoryIds: string[], name: string, max: number, min: number, take: number, skip: number): Promise<PaginationResponse<Product>> {
    let result: any[] = [];
    let categories: string[] = []
    let [products, total] = [[], 0]

    if (typeof categoryIds === 'string') {
      categories = [categoryIds]
    } else {
      categories = categoryIds
    }


    for (const category of categories) {
      const query = await this.filterProductsByCategoryId(category)

      if (query.length > 0) {
        for (const product of query) {
          result.push(product)
        }
      }
    }


    let query = this.productRepository.createQueryBuilder('product')
      .where('product.id IN (:...subQuery)', { subQuery: result.map(a => a.id) })
      .innerJoinAndSelect('product.categories', 'categories')
      .innerJoin('product.shop', 'shop')
      .addSelect(['shop.id', 'shop.name'])
      .innerJoin('shop.user', 'user')
      .addSelect(['user.id'])
      .take(take || 10)
      .skip(skip || 0)


    if (shopId) {
      const shop = await this.shopsService.findById(shopId)
      if (!shop) throw new NotFoundException()
      query.andWhere('shop.id = :shopId', { shopId: shopId })
    }

    if (name) {
      query.andWhere("product.name ilike :name", { name: `%${name}%` })
    }
    if (max && min) {
      query.andWhere('product.price >= :min AND product.price <= :max', { min, max })
    }
    if (max && !min) {
      query.andWhere('product.price <= :max', { max })
    }
    if (!max && min) {
      query.andWhere('product.price >= :min', { min })
    }

    try {
      [products, total] = await query.getManyAndCount()
    } catch (error) {
      [products, total] = [[], 0]
    }

    return {
      total: total,
      data: products
    }
  }


  async filterProductsByCategoryId(categoryId: string) {
    try {
      const products = await this.productRepository.createQueryBuilder('product')
        .select(['product.id', 'product.name'])
        .innerJoinAndSelect('product.categories', 'categories')
        .innerJoin('product.categories', 'category', 'category.id = :id', { id: categoryId })
        .getMany();
      return products
    } catch (err) {
      console.log(err);
      return [];
    }
  }

}