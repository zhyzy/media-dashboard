import { IsString, IsOptional, IsNumber } from 'class-validator';

export class CreateShootingDto {
  @IsOptional()
  @IsNumber()
  scriptId?: number;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  shootingDate?: string;

  @IsOptional()
  @IsString()
  shootingLocation?: string;

  @IsOptional()
  @IsString()
  cameraMan?: string;

  @IsOptional()
  @IsString()
  performer?: string;

  @IsOptional()
  @IsString()
  director?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateShootingDto extends CreateShootingDto {}
