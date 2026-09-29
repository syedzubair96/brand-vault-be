import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

export const ASSET_SORTS = ['updated_desc', 'name_asc'] as const;
export type AssetSort = (typeof ASSET_SORTS)[number];

const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' ? true : value === 'false' ? false : value;

export class ListAssetsDto {
  @ApiPropertyOptional({ example: 1, description: 'Only assets in this folder' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  folderId?: number;

  @ApiPropertyOptional({ example: 'banner', description: 'Case-insensitive search on the asset name' })
  @IsOptional()
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @MaxLength(200)
  q?: string;

  @ApiPropertyOptional({ enum: ASSET_SORTS, default: 'updated_desc' })
  @IsOptional()
  @IsIn(ASSET_SORTS)
  sort?: AssetSort;

  @ApiPropertyOptional({ example: false, description: 'true lists trashed assets instead of active ones' })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  trash?: boolean;
}
