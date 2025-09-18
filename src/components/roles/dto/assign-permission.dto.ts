import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsUUID } from "class-validator";

export class AssignPermissionsDto {
  @ApiProperty({
    description: "Array of permission IDs to assign to the role",
    example: ["uuid1", "uuid2", "uuid3"],
    type: [String],
  })
  @IsArray()
  @IsUUID("4", { each: true })
  permissionIds: string[];
}
