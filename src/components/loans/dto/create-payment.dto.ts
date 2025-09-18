import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsUUID, IsNumber, IsPositive, IsDateString, IsOptional, IsString } from "class-validator"

export class CreatePaymentDto {
  @ApiProperty({
    description: "Loan ID",
    example: "uuid-string",
  })
  @IsUUID()
  @IsNotEmpty()
  loanId: string

  @ApiProperty({
    description: "Payment amount",
    example: 500.0,
  })
  @IsNumber()
  @IsPositive()
  amount: number

  @ApiProperty({
    description: "Payment date",
    example: "2024-01-15",
  })
  @IsDateString()
  paymentDate: Date

  @ApiProperty({
    description: "Payment notes",
    example: "Cash payment received",
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string

  @ApiProperty({
    description: "Receipt number",
    example: "RCP-001",
    required: false,
  })
  @IsOptional()
  @IsString()
  receiptNumber?: string
}
