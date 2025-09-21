import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ResetTokenDto {
  @ApiProperty({
    description: "Reset token to generate new access token",
    example: "abc123def456ghi789",
  })
  @IsString()
  @IsNotEmpty()
  reset_token: string;
}


