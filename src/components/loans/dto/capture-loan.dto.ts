import { IsOptional, IsString, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CaptureLoanDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  business?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentMode?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
  loanDurationMonths?: number;
}
