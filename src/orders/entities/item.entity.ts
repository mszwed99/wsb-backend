import { Product } from "src/products/entities";
import { Shop } from "src/shops/entities";
import { BaseEntity, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Order } from "./order.entity";

@Entity()
export class Item extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    name: string;

    @Column()
    amount: number;

    @Column({ type: 'float'})
    itemPrice: number;

    @Column()
    vat: number;

    @Column({ nullable: false, type: 'float'})
    price: number;

    @ManyToOne(() => Product, product => product.items, {onDelete: 'SET NULL'})
    product: Product;

    @ManyToOne(() => Shop, shop => shop.items)
    shop: Shop;
    
    @ManyToOne(() => Order, order => order.items)
    order: Order


    public getNetPrice() {
        const tax = this.vat / 100
        let price = (this.itemPrice - (this.itemPrice * tax)).toFixed(2) 
        return Number(price)
    }
}

