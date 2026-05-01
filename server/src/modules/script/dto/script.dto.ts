import { IsString, IsOptional } from 'class-validator';

export class CreateScriptDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  scriptType?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  performer?: string;

  @IsOptional()
  @IsString()
  cameraMan?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  platformTarget?: string;

  @IsOptional()
  @IsString()
  estimatedDuration?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateScriptDto extends CreateScriptDto {}
