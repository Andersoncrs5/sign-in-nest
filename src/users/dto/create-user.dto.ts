import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, Length } from "class-validator";

export class CreateUserDto {
    
    @IsString({ message: "The field name should be a string" })
    @IsNotEmpty({ message: "The field name cannot be null" })
    @Length(1, 100, { message: "The max length of name is 100 and min is 1" })
    @ApiProperty({ example : "" })
    name: string;

    @IsString({ message: "The field email should be a string" })
    @IsNotEmpty({ message: "The field email cannot be null" })
    @Length(1, 150, { message: "The max length of email is 150 and min is 1" })
    @IsEmail({}, { message: "The field email must be a valid email address" })
    @ApiProperty({ example : "" })
    email: string;
    
    @IsString({ message: "The field password should be a string" })
    @IsNotEmpty({ message: "The field password cannot be null" })
    @Length(6, 50, { message: "The max length of password is 50 and min is 6" })
    @ApiProperty({ example : "" })
    password: string;
}