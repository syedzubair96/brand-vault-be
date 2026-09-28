import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  MaxLength,
} from 'class-validator';
import { ASSET_TYPE_DESCRIPTION, ASSET_TYPE_IDS } from '../asset-types.js';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateAssetDto {
  @ApiProperty({ example: 'Summer campaign banner', maxLength: 200 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @ApiProperty({ example: 1, enum: ASSET_TYPE_IDS, description: ASSET_TYPE_DESCRIPTION })
  @IsInt()
  @IsIn(ASSET_TYPE_IDS, { message: `type must be one of: ${ASSET_TYPE_DESCRIPTION}` })
  type: number;

  @ApiProperty({ example: 'https://example.com/banner.png', description: 'HTTPS URL of the asset' })
  @Transform(trim)
  @IsUrl({ require_protocol: true, protocols: ['https'] }, { message: 'LogoURL must be an https URL' })
  @MaxLength(2048)
  LogoURL: string;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    type: Number,
    description: 'Folder id',
  })
  @IsInt()
  @IsPositive()
  FolderId: number ;

  @ApiProperty({ example: 1, description: 'Temporary until auth: id of the owning user' })
  @IsInt()
  @IsPositive()
  createdBy: number;
}
