import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsString, IsOptional, IsBoolean } from "class-validator"

export class CreateRoleDto {
  @ApiProperty({
    description: "Role name",
    example: "Manager",
  })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiProperty({
    description: "Role description",
    example: "Can manage loan disbursements",
  })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiProperty({
    description: "Whether the role is active",
    example: true,
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
