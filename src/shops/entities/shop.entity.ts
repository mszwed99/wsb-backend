import { NoInferType } from "@nestjs/config";
import { Address } from "src/addresses/entities";
import { Item, Order } from "src/orders/entities";
import { ShopStatus } from "src/orders/entities/shopStatus.entity";
import { Product } from "src/products/entities";
import { User } from "src/users/entities";
import { BaseEntity, Column, Entity, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn, Unique } from "typeorm";


@Entity()
@Unique(['name'])
export class Shop extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number

    @Column()
    name: string;

    @Column()
    bio: string;

    @Column({ unique: true })
    nip: string;

    @Column({ unique: true })
    bankAccount: string;

    @Column({default: true})
    isActive: boolean

    @ManyToOne(() => User, user => user.shops, { eager: true })
    user: User;

    @OneToMany(() => Address, address => address.shop, { onDelete: 'CASCADE', eager: true })
    addresses?: Address[] | null;

    @OneToMany(() => Product, product => product.shop, { onDelete: 'CASCADE'})
    products?: Product[] | null;

    @OneToMany(() => Item, item => item.product)
    items?: Item[]


    @ManyToMany(() => Order, order => order.shops)
    orders: Order[] | null

    @OneToMany(() => ShopStatus, shopStatus => shopStatus.shop)
    shopStatuses: ShopStatus[]

}
