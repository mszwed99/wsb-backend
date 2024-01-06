import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from 'src/addresses/entities';
import { SignUpDto } from 'src/auth/dto';
import { hashData } from 'src/auth/handlers';
import { PaginationResponse, UserPaginationOptions } from 'src/common/pagination';
import { Shop } from 'src/shops/entities';
import { Repository } from 'typeorm';
import { Role, Roles, User } from './entities';


@Injectable()
export class UsersService {

  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Roles) private readonly rolesRepository: Repository<Roles>
  ) {}

  // Create user in a database
  async create(dto: SignUpDto): Promise<User> {
    const { email, password, name, surname } = dto
    const hashedPassword = await hashData(password)

    const user = this.userRepository.create({
      email,
      password: hashedPassword,
      name,
      surname
    })

    await this.userRepository.save(user)
      .catch((error) => {
        if(error.code === '23505') {
          throw new ConflictException('User with the given e-mail address already exists')
        } else {
          throw new InternalServerErrorException();
        }
      })
     
    return user
  }

  async grantRoles(id: number, newRoles: Role[]): Promise<void> {

    const roles = await this.rolesRepository.createQueryBuilder("role")
    .where("role.name IN (:...newRoles)", { newRoles })
    .getMany()

    const user = await this.findOneWitchRelations(id, ['roles'])
    user.roles.push.apply(user.roles, roles)

    await this.userRepository.save(user)
  }

  
  async revokeRoles(id: number, delRoles: Role[]): Promise<void> {

    const roles = await this.rolesRepository.createQueryBuilder("role")
    .where("role.name IN (:...delRoles)", { delRoles })
    .getMany()


    const user = await this.findOneWitchRelations(id, ['roles'])
    roles.forEach(role => {
      user.roles = user.roles.filter(e => e.id !== role.id)
    });
    
    await this.userRepository.save(user)
  }


  async getRoles(id: number): Promise<Role[]> {
    const user = await this.userRepository.findOne({ id }, {relations: ['roles']})
    const roles: Role[] = []
    user.roles.forEach(element => {
        roles.push(element.name as Role)
    });
    return roles
  }


  // Find user with a given email
  async findByEmail(email: string): Promise<User> {
    const user = await this.userRepository.findOne({ email })
    if (!user) throw new NotFoundException()
    return user
  }

  // Find user with a given id
  async findById(id: number): Promise<User> {
    const user = await this.userRepository.findOne(id)
    if (!user) throw new NotFoundException()
    return user
  }

  async findAdresses(id: number): Promise<Address[]> {
    const user = await this.findOneWitchRelations(id, ['addresses'])
    if (!user) throw new NotFoundException()
    return user.addresses
  }

  async findShops(id: number): Promise<Shop[]> {
    const user = await this.findOneWitchRelations(id, ['shops'])
    if (!user) throw new NotFoundException()
    return user.shops
  }
  
  // Find user with a given id
  async findOneWitchRelations(id: number, relations: string[]): Promise<User> {
    const user = await this.userRepository.findOne({ id }, {relations})
    if (!user) throw new NotFoundException()
    return user
  }

  // Update user rt hash in a data base
  async updateRtHash(userId: number, rt: string | null): Promise<void> {
    const hashedRt = await hashData(rt)
    await this.userRepository
    .createQueryBuilder()
        .update(User)
        .set({hashedRt})
        .where("id = :id", {id: userId})
        .execute()
  }

  

  // Do przetestowania
  async findAll(options: UserPaginationOptions): Promise<PaginationResponse<User>> {
    const { take, skip, addresses, roles, orders, shops } = options
    const relations: string[] = []
    if(String(roles) === 'true') relations.push('roles')
    if(String(addresses) === 'true') relations.push('addresses')
    if(String(orders) === 'true') relations.push('orders')
    if(String(shops) === 'true') relations.push('shops')

    const [ users, total] = await this.userRepository.findAndCount({
      take: take || 10,
      skip: skip || 0,
      relations
    })

    return {
      total: total,
      data: users
    }
  }

  
}
