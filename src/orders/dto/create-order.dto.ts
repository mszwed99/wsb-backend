import { IsNotEmpty, IsOptional, Matches } from "class-validator";
import { Item } from "../types/item.type";

export class CreateOrderDto {
    @IsOptional()
    @Matches('^[0-9]{10}$')
    nip?: string;

    @IsNotEmpty()
    addressId: number

    @IsNotEmpty()
    items: Item[];

}
