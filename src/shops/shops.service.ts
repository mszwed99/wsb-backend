import { ConflictException, ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/addresses/entities';
import { PaginationResponse, ShopPaginationOptions } from 'src/common/pagination';
import { Product } from 'src/products/entities';
import { Role } from 'src/users/entities';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateShopDto } from './dto/create-shop.dto';
import { Shop } from './entities/shop.entity';
import { HttpService  } from '@nestjs/axios';
import { AxiosResponse } from 'axios'
import { Observable, firstValueFrom } from 'rxjs';



@Injectable()
export class ShopsService {
  constructor(
    private readonly usersService: UsersService,
    private httpService: HttpService,
    @InjectRepository(Address) private readonly addressRepository: Repository<Address>,
    @InjectRepository(Shop) private readonly shopRepository: Repository<Shop>,
  ) {}

  async create(dto: CreateShopDto, id: number) {
    const user = await this.usersService.findOneWitchRelations(id, ['addresses'])
    
    const address = await this.addressRepository.create({
      label: `Shop - ${dto.name}`,
      city: dto.city,
      postCode: dto.postCode,
      street: dto.street,
      phoneNumber: dto.phoneNumber
    })

    await address.save()
    
    
    const shop = await this.shopRepository.create({
      name: dto.name,
      nip: dto.nip,
      bio: dto.bio,
      addresses: [address],
      bankAccount: dto.bankAccount,
      user
    })

    await shop.save().catch((error) => {
      if(error.code === '23505') {
        throw new ConflictException('Shop with the given credentials already exists')
      } else {
        throw new InternalServerErrorException();
      }
    })
    user.addresses = [...user.addresses, address]
    user.save()

    await this.usersService.grantRoles(user.id, [Role.Seller])
  }

  async remove(userId: number, shopId: number) {
    const shop = await this.findOneWitchRelations(shopId, ['user'])
    const user = await this.usersService.findOneWitchRelations(userId, ['shops', 'roles'])
    if (shop.user.id !== user.id) throw new ForbiddenException()

    user.shops = user.shops.filter(e => e.id !== shop.id)
    await this.shopRepository.remove(shop).catch(err => {
      throw new InternalServerErrorException()
    })
    if(!user.shops.length) await this.usersService.revokeRoles(userId, [Role.Seller])
  }

  async findByIds(shopIds: number[]) {
    let shops = await this.shopRepository.createQueryBuilder('shop')
      .where('shop.id IN (:...shopIds)', { shopIds: shopIds }).getMany()

    return shops
  }


  async findInActive(options: ShopPaginationOptions): Promise<PaginationResponse<Shop>> {
    const { take, skip, addresses, user, products } = options
    const relations: string[] = []
    if(String(addresses) === 'true') relations.push('addresses')
    if(String(user) === 'true') relations.push('user')
    if(String(products) === 'true') relations.push('products')
    const [ shops, total] = await this.shopRepository.findAndCount({
      where: {
        isActive: false
      },
      take: take || 10,
      skip: skip || 0,
      relations
    })
    return {
      total: total,
      data: shops
    }
  }

  async findActive(options: ShopPaginationOptions): Promise<PaginationResponse<Shop>> {
    const { take, skip, addresses, user, products } = options
    const relations: string[] = []
    if(String(addresses) === 'true') relations.push('addresses')
    if(String(user) === 'true') relations.push('user')
    if(String(products) === 'true') relations.push('products')
    const [ shops, total] = await this.shopRepository.findAndCount({
      where: {
        isActive: true
      },
      take: take || 10,
      skip: skip || 0,
      relations
    })
    return {
      total: total,
      data: shops
    }
  }

  async changeStatus(id: number) {
    const shop = await this.findById(id)
    shop.isActive = !shop.isActive
    shop.save()
  }


  async findOne(shopId: number) {
    const shop = await this.findOneWitchRelations(shopId, ['user'])
    return shop
  }

  async findById(id: number) {
    const shop = await this.shopRepository.findOne(id).catch(err => {
      throw new NotFoundException()
    })
    if (!shop) throw new NotFoundException()
    return shop
  }

  async findOneWitchRelations(id: number, relations: string[]): Promise<Shop> {
    const shop = await this.shopRepository.findOne({ id }, {relations}).catch(err => {
      throw new NotFoundException()
    })
    if(!shop) throw new NotFoundException()
    return shop
  }

  async findAll(options: ShopPaginationOptions): Promise<PaginationResponse<Shop>> {
    const { take, skip, addresses, user, products } = options
    const relations: string[] = []
    if(String(addresses) === 'true') relations.push('addresses')
    if(String(user) === 'true') relations.push('user')
    if(String(products) === 'true') relations.push('products')

    const [ shops, total] = await this.shopRepository.findAndCount({

      take: take || 10,
      skip: skip || 0,
      relations
    })
    return {
      total: total,
      data: shops
    }

   
    }
    async getCompany(nip): Promise<Observable<AxiosResponse<any>>>{
      const date = new Date();
      const day = date.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      const formattedDate = `${year}-${month < 10 ? `0${month}` : month}-${day < 10 ? `0${day}` : day}`
      const url = `https://wl-api.mf.gov.pl/api/search/nip/${nip}?date=${formattedDate}`
      const { data } = await firstValueFrom(this.httpService.get(url, {headers: { 'Content-Type': 'application/json' }}));
      
      return data;
  }
}
