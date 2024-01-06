import { BaseEntity, Column, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";
import { Roles } from ".";
import { Exclude } from "class-transformer";
import { Shop } from "src/shops/entities";
import { Address } from "src/addresses/entities";
import { Order } from "src/orders/entities";


@Entity()
@Unique(['email'])
export class User extends BaseEntity{

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    email: string;

    @Column()
    name: string;

    @Column()
    surname: string;

    @Exclude()
    @Column()
    password: string;

    @OneToMany(() => Address, address => address.user)
    addresses?: Address[] | null;

    @OneToMany(() => Shop, shop => shop.user)
    shops?: Shop[] | null;

    @OneToMany(() => Order, order => order.user)
    orders?: Order[] | null

    @Exclude()
    @Column({default: null})
    hashedRt?: string | null

    @ManyToMany(() => Roles, role => role.users, )
    roles: Roles[]
}


