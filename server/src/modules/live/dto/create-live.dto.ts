import { IsInt, Min, IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateLiveDto {
  @IsString()
  platform: string;

  @IsOptional()
  @IsString()
  accountName?: string;

  @IsInt()
  @Min(0)
  exposure: number;

  @IsInt()
  @Min(0)
  viewers: number;

  @IsOptional()
  @IsString()
  avgStayDuration?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  salesAmount?: number;

  @IsOptional()
  @IsString()
  recordDate?: string;
}
