import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class VerifyEmailDto {
  @ApiProperty({
    description: "Email verification token",
    example: "abc123def456ghi789",
  })
  @IsString()
  @IsNotEmpty()
  token: string;
}


