import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, MinLength } from "class-validator";

export class ResetPasswordDto {
  @ApiProperty({
    description: "Password reset token",
    example: "abc123def456...",
  })
  @IsString()
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: "New password (minimum 6 characters)",
    example: "newpassword123",
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
