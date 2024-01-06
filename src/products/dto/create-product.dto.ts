import { IsNotEmpty } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    name: string;

    @IsNotEmpty()
    price: number; 

    vat?: number;

    description?: string;
    
    amount?: number;

    categories?: string[]
}
