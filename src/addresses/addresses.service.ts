import { ForbiddenException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersService } from 'src/users/users.service';
import { Repository } from 'typeorm';
import { CreateAddressDto } from './dto/create-address.dto';
import { Address } from './entities';

@Injectable()
export class AddressesService {

  constructor( 
    @InjectRepository(Address) private readonly addressRepository: Repository<Address>,
    private readonly usersService: UsersService
  ) {}
  
  async addAddress(userId: number, dto: CreateAddressDto): Promise<void> {
    const address = await this.addressRepository.create({
      label: dto.label,
      city: dto.city,
      postCode: dto.postCode,
      street: dto.street,
      phoneNumber: dto.phoneNumber
    })
    const addressResult = await this.addressRepository.save(address).catch(error => {
      throw new InternalServerErrorException();
    })
    const user = await this.usersService.findOneWitchRelations(userId, ['addresses']);
    user.addresses = [... user.addresses, addressResult]
    await user.save();
  }

  async deleteAddress(userId: number, addreesId: number): Promise<void> {
    const user = await this.usersService.findOneWitchRelations(userId, ['addresses']).catch(err => {
      throw new NotFoundException()
    })
    await this.addressRepository.findOneOrFail({ id: addreesId }).catch(err => {
      throw new NotFoundException()
    })
    if(!(user.addresses.some(address => address.id === addreesId))) throw new ForbiddenException()
    const addresses = user.addresses.filter(address => address.id !== addreesId)
    user.addresses = addresses
    await user.save()
  }

  async getAddresses(userId: number): Promise<Address[]>{
    const user = await this.usersService.findOneWitchRelations(userId, ['addresses'])
    if (!user) throw new NotFoundException()
    return user.addresses
  }

  async findOne(addressId: number): Promise<Address> {
    const address = await this.addressRepository.findOneOrFail(addressId).catch(err => {
      throw new NotFoundException('Address not found')
    })
    if (!address) throw new NotFoundException('Address not found')
    return address
  }
}