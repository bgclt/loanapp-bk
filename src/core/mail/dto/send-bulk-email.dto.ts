import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsEmail, IsNotEmpty, IsString } from "class-validator"

export class SendBulkEmailDto {
  @ApiProperty({
    description: "Array of email addresses",
    example: ["user1@example.com", "user2@example.com"],
  })
  @IsArray()
  @IsEmail({}, { each: true })
  emails: string[]

  @ApiProperty({
    description: "Email subject",
    example: "Important System Update",
  })
  @IsString()
  @IsNotEmpty()
  subject: string

  @ApiProperty({
    description: "HTML content of the email",
    example: "<h1>System Update</h1><p>We have updated our system...</p>",
  })
  @IsString()
  @IsNotEmpty()
  htmlContent: string

  @ApiProperty({
    description: "Plain text content of the email",
    example: "System Update\n\nWe have updated our system...",
  })
  @IsString()
  @IsNotEmpty()
  textContent: string
}
