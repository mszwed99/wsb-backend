import { BaseEntity, Column, Entity, JoinTable, ManyToMany, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "./user.entity";


export enum Role {
    Customer = 'customer',
    Seller = 'seller',
    Admin = 'admin',
}


@Unique(['name'])
@Entity()
export class Roles extends BaseEntity {

    @PrimaryGeneratedColumn('uuid')
    id: number;

    @Column()
    name: string;

    @ManyToMany(() => User, user => user.roles,  { cascade: true })
    @JoinTable()
    users: User[];
}