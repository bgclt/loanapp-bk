import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreatePermissionDto {
  @ApiProperty({
    description: "Permission name",
    example: "canCreateUsers",
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: "Permission description",
    example: "Can create new users",
  })
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({
    description: "Resource this permission applies to",
    example: "users",
  })
  @IsString()
  @IsNotEmpty()
  resource: string;

  @ApiProperty({
    description: "Action this permission allows",
    example: "create",
  })
  @IsString()
  @IsNotEmpty()
  action: string;
}
