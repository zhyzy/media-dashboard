import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateMediaDto {
  @IsString()
  platform: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  publishStatus?: string;

  @IsOptional()
  @IsString()
  publishDate?: string;

  @IsInt()
  @Min(0)
  readCount: number;

  @IsInt()
  @Min(0)
  likeCount: number;

  @IsInt()
  @Min(0)
  commentCount: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  shareCount?: number;

  @IsOptional()
  @IsString()
  recordDate?: string;
}
