import { IsInt, Min, IsString, IsOptional } from 'class-validator';

export class CreateKuaishouDto {
  @IsString()
  accountName: string;

  @IsInt()
  @Min(0)
  playCount: number;

  @IsInt()
  @Min(0)
  likeCount: number;

  @IsInt()
  @Min(0)
  commentCount: number;

  @IsInt()
  @Min(0)
  shareCount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  exposure?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  viewers?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  recordDate?: string;
}
