import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsOptional, IsIn } from "class-validator";

export class UpdateSettingDto {
  @ApiProperty({
    description: "Setting value",
    example: "My Company Name",
  })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({
    description: "Setting description",
    example: "The name of the company displayed in the system",
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: "Setting type for value parsing",
    example: "string",
    enum: ["string", "number", "boolean", "json"],
    required: false,
  })
  @IsOptional()
  @IsIn(["string", "number", "boolean", "json"])
  type?: string;
}
