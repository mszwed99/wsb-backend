import { Address } from "src/addresses/entities";
import { Shop } from "src/shops/entities";
import { User } from "src/users/entities";
import { BaseEntity, Column, CreateDateColumn, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Item } from "./item.entity";
import { ShopStatus } from "./shopStatus.entity";


export enum OrderStatus {
    Pending = 'pending',
    Canceled = 'canceled',
    Paid = 'paid',
    Confirmed = 'confirmed',
    Complete = 'complete'
}


@Entity()
export class Order extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({nullable: true})
    nip?: string;

    @ManyToOne(() => Address, address => address.orders, { eager: true })
    address: Address

    @ManyToOne(() => User, user => user.orders, { eager: true })
    user: User;

    @ManyToMany(() => Shop, shop => shop.orders)
    @JoinTable()
    shops: Shop[];

    @OneToMany(() => Item, item => item.order, { eager: true, onDelete: 'CASCADE'})
    items: Item[]

    @Column({ type: 'float'})
    totalPrice: number


    @Column({default: OrderStatus.Pending})
    status: OrderStatus


    @OneToMany(() => ShopStatus, shopStatus => shopStatus.order)
    shopStatuses: ShopStatus[]


    @CreateDateColumn()
    created_at: Date;
}


