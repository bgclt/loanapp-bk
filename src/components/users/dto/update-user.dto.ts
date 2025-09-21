import { PartialType, OmitType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";
import { IsOptional, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ["password"] as const)) {
  @ApiProperty({
    description: "Email verification timestamp",
    example: "2023-12-01T10:00:00.000Z",
    required: false,
  })
  @IsOptional()
  @IsDateString()
  emailVerifiedAt?: Date;
}
