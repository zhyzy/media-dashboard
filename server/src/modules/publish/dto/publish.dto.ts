import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreatePublishDto {
  @IsOptional()
  @IsNumber()
  shootingId?: number;

  @IsOptional()
  @IsNumber()
  scriptId?: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  publisher?: string;

  @IsOptional()
  @IsString()
  platform?: string;

  @IsOptional()
  @IsString()
  publishDate?: string;

  @IsOptional()
  @IsString()
  publishUrl?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsNumber()
  viewCount?: number;

  @IsOptional()
  @IsNumber()
  likeCount?: number;

  @IsOptional()
  @IsNumber()
  commentCount?: number;

  @IsOptional()
  @IsNumber()
  shareCount?: number;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdatePublishDto extends CreatePublishDto {}
