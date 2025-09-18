import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsString } from "class-validator"

export class DisburseLoanDto {
  @ApiProperty({
    description: "Disbursement notes",
    example: "Amount disbursed via bank transfer",
    required: false,
  })
  @IsOptional()
  @IsString()
  disbursementNotes?: string
}
