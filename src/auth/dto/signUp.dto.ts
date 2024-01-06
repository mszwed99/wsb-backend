import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from "class-validator";

export class SignUpDto {

    @IsEmail()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    @IsString()
    @IsNotEmpty()
    @MaxLength(15, {
        message: 'Name is too long. Maximal length is $constraint1 characters'
    })
    @MinLength(3, {
        message: 'Surname is too long. Maximal length is $constraint1 characters'
    })
    name: string;


    @IsString()
    @IsNotEmpty()
    @MaxLength(15, {
        message: 'Surname is too long. Maximal length is $constraint1 characters'
    })
    @MinLength(3, {
        message: 'Surname is too short. Minimal length is $constraint1 characters'
    })
    surname: string;

    
    isSeller?: boolean = false

}
