import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsNotEmpty,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  normalizeTag,
} from '../../ai/asset-suggestion.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class SaveAiMetadataDto {
  @ApiProperty({ example: ['campaign', 'social', 'banner'] })
  @Transform(({ value }: { value: unknown }) =>
    Array.isArray(value)
      ? [...new Set(value.map((t) => (typeof t === 'string' ? normalizeTag(t) : t)))]
      : value,
  )
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @Matches(/^[^,]*$/, { each: true, message: 'tags must not contain commas' })
  tags: string[];

  @ApiProperty({ example: 'Summer campaign banner image for the Social Media folder.'})
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty({ example: 'Suitable for social posts or website banners.'})
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  usage_suggestion: string;
}
