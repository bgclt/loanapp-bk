import { ApiProperty } from "@nestjs/swagger"
import { IsOptional, IsDateString, IsEnum, IsString, ValidateNested } from "class-validator"
import { Type } from "class-transformer"
import { MaritalStatus, IdType } from "../../../common/enums/loan.enum"

class WitnessDto {
  @ApiProperty({ description: "Witness full name" })
  @IsString()
  fullname: string

  @ApiProperty({ description: "Witness contact" })
  @IsString()
  contact: string

  @ApiProperty({ description: "Witness marital status", enum: MaritalStatus })
  @IsEnum(MaritalStatus)
  maritalStatus: MaritalStatus

  @ApiProperty({ description: "Witness email", required: false })
  @IsOptional()
  @IsString()
  email?: string

  @ApiProperty({ description: "Witness occupation" })
  @IsString()
  occupation: string

  @ApiProperty({ description: "Witness residence address" })
  @IsString()
  residenceAddress: string

  @ApiProperty({ description: "Witness residence GPS", required: false })
  @IsOptional()
  @IsString()
  residenceGps?: string
}

class BusinessLocationDto {
  @ApiProperty({ description: "Business location name" })
  @IsString()
  name: string

  @ApiProperty({ description: "Business location address" })
  @IsString()
  address: string

  @ApiProperty({ description: "Business location GPS address", required: false })
  @IsOptional()
  @IsString()
  gpsAddress?: string

  @ApiProperty({ description: "Business location region" })
  @IsString()
  region: string
}

class ResidenceDto {
  @ApiProperty({ description: "Residence name" })
  @IsString()
  name: string

  @ApiProperty({ description: "Residence address" })
  @IsString()
  address: string

  @ApiProperty({ description: "Residence GPS address", required: false })
  @IsOptional()
  @IsString()
  gpsAddress?: string

  @ApiProperty({ description: "Residence region" })
  @IsString()
  region: string
}

export class UpdateLoanCapturingDto {
  @ApiProperty({ description: "Client date of birth", required: false })
  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date

  @ApiProperty({ description: "Client marital status", enum: MaritalStatus, required: false })
  @IsOptional()
  @IsEnum(MaritalStatus)
  maritalStatus?: MaritalStatus

  @ApiProperty({ description: "Client profile description", required: false })
  @IsOptional()
  @IsString()
  clientProfile?: string

  @ApiProperty({ description: "Client occupation", required: false })
  @IsOptional()
  @IsString()
  clientOccupation?: string

  @ApiProperty({ description: "ID type", enum: IdType, required: false })
  @IsOptional()
  @IsEnum(IdType)
  idType?: IdType

  @ApiProperty({ description: "ID number", required: false })
  @IsOptional()
  @IsString()
  idNumber?: string

  @ApiProperty({ description: "Witness information", type: WitnessDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => WitnessDto)
  witness?: WitnessDto

  @ApiProperty({ description: "Business location information", type: BusinessLocationDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessLocationDto)
  businessLocation?: BusinessLocationDto

  @ApiProperty({ description: "Residence information", type: ResidenceDto, required: false })
  @IsOptional()
  @ValidateNested()
  @Type(() => ResidenceDto)
  residence?: ResidenceDto
}
