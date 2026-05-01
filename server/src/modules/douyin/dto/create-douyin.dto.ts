import { IsString, IsInt, Min, IsOptional } from 'class-validator';

export class CreateDouyinDto {
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
  @IsString()
  recordDate?: string;
}
