import { IsString, IsNumber, Min, IsOptional } from 'class-validator';

export class CreateExpenseDto {
  @IsOptional()
  @IsString()
  department?: string;

  @IsString()
  category: string;

  @IsString()
  description: string;

  @IsNumber()
  @Min(0)
  amount: number;

  @IsString()
  expenseDate: string;

  @IsOptional()
  @IsString()
  createdBy?: string;
}
