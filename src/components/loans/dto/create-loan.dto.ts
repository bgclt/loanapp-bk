import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsEmail, IsOptional, IsNumber, IsPositive } from "class-validator"

export class CreateLoanDto {
  @ApiProperty({
    description: "Client full name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  clientFullname: string

  @ApiProperty({
    description: "Client contact number",
    example: "+1234567890",
  })
  @IsString()
  @IsNotEmpty()
  clientContact: string

  @ApiProperty({
    description: "Client email address",
    example: "john.doe@example.com",
    required: false,
  })
  @IsEmail()
  @IsOptional()
  clientEmail?: string

  @ApiProperty({
    description: "Client location including landmark",
    example: "123 Main St, Near Central Market, Accra",
  })
  @IsString()
  @IsNotEmpty()
  clientLocation: string

  @ApiProperty({
    description: "Requested loan amount",
    example: 5000.0,
  })
  @IsNumber()
  @IsPositive()
  requestedAmount: number

  @ApiProperty({
    description: "Client business description",
    example: "Small retail shop selling groceries",
  })
  @IsString()
  @IsNotEmpty()
  clientBusiness: string
}
