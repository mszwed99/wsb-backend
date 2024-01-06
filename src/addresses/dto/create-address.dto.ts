import { IsNotEmpty, Matches } from "class-validator";

export class CreateAddressDto {

    @IsNotEmpty()
    label?: string;

    @IsNotEmpty()
    city: string;

    @Matches('^(?=.*[0-9].*)([_0-9]{2}-[_0-9]{3})$')
    postCode: string;

    @IsNotEmpty()
    street: string;

    @Matches('^[0-9]{9}$')
    phoneNumber: string;

}
