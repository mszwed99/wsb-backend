import { Transform, TransformFnParams } from "class-transformer";
import { IsNotEmpty, IsNumber, IsNumberString, IsString, Length, Matches } from "class-validator";
export class CreateShopDto {
    
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsNotEmpty()
    bio: string;

    @IsNotEmpty()
    @Matches('^[0-9]{10}$')
    nip: string;

    @IsNotEmpty()
    city: string;

    @Matches('^(?=.*[0-9].*)([_0-9]{2}-[_0-9]{3})$')
    postCode: string;

    @IsNotEmpty()
    street: string;

    @Matches('^[0-9]{9}$')
    phoneNumber: string;

    @Length(26,26)
    @IsNumberString()
    bankAccount:string;
}
