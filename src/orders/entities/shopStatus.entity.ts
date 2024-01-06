import { Shop } from "src/shops/entities";
import { BaseEntity, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity()
export class ShopStatus extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column({default: false})
    status: boolean


    @ManyToOne(() => Order, order => order.shopStatuses, { eager: true })
    order: Order

    @ManyToOne(() => Shop, shop => shop.shopStatuses, { eager: true })
    shop: Shop
}
