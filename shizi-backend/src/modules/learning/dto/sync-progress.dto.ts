import { IsObject, IsArray, IsString, IsNumber, IsOptional } from 'class-validator';

export class SyncProgressDto {
  @IsObject()
  @IsOptional()
  charRecords?: Record<string, any>;

  @IsObject()
  @IsOptional()
  unitProgressMap?: Record<string, any>;

  @IsArray()
  @IsOptional()
  wrongRecords?: any[];

  @IsArray()
  @IsOptional()
  learnDays?: string[];

  @IsString()
  @IsOptional()
  currentLibraryId?: string;

  @IsNumber()
  @IsOptional()
  currentStageIndex?: number;

  @IsString()
  @IsOptional()
  currentUnitId?: string;

  @IsNumber()
  @IsOptional()
  clientUpdatedAt?: number;
}
