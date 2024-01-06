import { Order } from "src/orders/entities";
import { Shop } from "src/shops/entities/shop.entity";
import { User } from "src/users/entities";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Address extends BaseEntity{

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    label: string;

    @Column()
    city: string;

    @Column()
    postCode: string;

    @Column()
    street: string;

    @Column()
    phoneNumber: string;

    @ManyToOne(() => User, user => user.addresses)
    user: User

    @ManyToOne(() => Shop, shop => shop.addresses,  { onDelete: 'CASCADE' })
    shop: Shop
    
    @OneToMany(() => Order, order => order.address)
    orders?: Order[] | null
}


