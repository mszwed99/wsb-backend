import { Product } from "src/products/entities";
import { BaseEntity, Column, Entity, ManyToMany, PrimaryGeneratedColumn, Unique } from "typeorm";

@Entity()
@Unique(['name'])
export class Category extends BaseEntity{
    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => Product, product => product.categories)
    prodcuts: Product[]
}
