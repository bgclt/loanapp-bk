import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class SendLoanNotificationDto {
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
    description: "Loan status",
    example: "approved",
  })
  @IsString()
  @IsNotEmpty()
  status: string

  @ApiProperty({
    description: "Notification message",
    example: "Your loan has been approved and will be disbursed soon.",
  })
  @IsString()
  @IsNotEmpty()
  message: string
}
