import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class UpdateChildDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  age_group?: string;

  @IsString()
  @IsOptional()
  current_library?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  daily_new_chars?: number;
}
