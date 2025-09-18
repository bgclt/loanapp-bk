import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {
  @ApiProperty({
    description: "User full name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: "User email address",
    example: "john.doe@example.com",
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: "User phone number",
    example: "+1234567890",
  })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({
    description: "Company name",
    example: "Acme Corp",
    required: false,
  })
  @IsString()
  @IsOptional()
  companyName?: string;

  @ApiProperty({
    description: "Company address",
    example: "123 Business St, City, Country",
    required: false,
  })
  @IsString()
  @IsOptional()
  companyAddress?: string;

  @ApiProperty({
    description: "User password (minimum 6 characters)",
    example: "password123",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
