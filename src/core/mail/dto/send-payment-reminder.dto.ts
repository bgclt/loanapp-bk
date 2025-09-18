import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString, IsNumber, IsDateString } from "class-validator"

export class SendPaymentReminderDto {
  @ApiProperty({
    description: "Client email address",
    example: "client@example.com",
  })
  @IsEmail()
  email: string

  @ApiProperty({
    description: "Client name",
    example: "John Doe",
  })
  @IsString()
  @IsNotEmpty()
  clientName: string

  @ApiProperty({
    description: "Loan ID",
    example: "uuid-string",
  })
  @IsString()
  @IsNotEmpty()
  loanId: string

  @ApiProperty({
    description: "Due amount",
    example: 500.0,
  })
  @IsNumber()
  dueAmount: number

  @ApiProperty({
    description: "Due date",
    example: "2024-01-15",
  })
  @IsDateString()
  dueDate: string
}
