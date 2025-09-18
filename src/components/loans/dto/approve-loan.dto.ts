import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsPositive, IsEnum, IsOptional, IsString } from "class-validator"
import { PaymentSchedule } from "../../../common/enums/loan.enum"

export class ApproveLoanDto {
  @ApiProperty({
    description: "Approved loan amount",
    example: 4500.0,
  })
  @IsNumber()
  @IsPositive()
  approvedAmount: number

  @ApiProperty({
    description: "Loan duration in months",
    example: 12,
  })
  @IsNumber()
  @IsPositive()
  loanDuration: number

  @ApiProperty({
    description: "Payment schedule",
    enum: PaymentSchedule,
    example: PaymentSchedule.MONTHLY,
  })
  @IsEnum(PaymentSchedule)
  paymentSchedule: PaymentSchedule

  @ApiProperty({
    description: "Approval notes",
    example: "Approved after thorough assessment",
    required: false,
  })
  @IsOptional()
  @IsString()
  approvalNotes?: string
}
