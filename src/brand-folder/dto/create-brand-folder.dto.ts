import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsPositive,
  IsString,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateBrandFolderDto {
  @ApiProperty({ example: 'Social Media', maxLength: 100 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  FolderName: string;

  @ApiPropertyOptional({
    example: null,
    nullable: true,
    type: Number,
    description: 'Parent folder id. Omit or send null for a top-level folder.',
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  HeadFolderId?: number | null;

  @ApiProperty({ example: 1, description: 'Id of the creating user' })
  @IsInt()
  @IsPositive()
  createdBy: number;
}
