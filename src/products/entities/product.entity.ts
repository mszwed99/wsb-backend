import { Category } from "src/categories/entities";
import { Item } from "src/orders/entities";
import { Shop } from "src/shops/entities";
import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Product extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    name: string;

    @Column({default: 0})
    amount: number;

    @Column({ nullable: false, type: 'float'})
    price: number;
    
    @Column({default: null})
    vat?: number | null;

    @Column({default: null})
    description?: string | null;

    @Column({default: null})
    imgPath?: string | null;

    @ManyToOne(() => Shop, shop => shop.products, { onDelete: 'NO ACTION'})
    shop: Shop

    @ManyToMany(() => Category, category => category.prodcuts, { eager: true })
    @JoinTable()
    categories?: Category[]

    @OneToMany(() => Item, item => item.product)
    items?: Item[]

}

