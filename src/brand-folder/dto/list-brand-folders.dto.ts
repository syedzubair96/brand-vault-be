import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';

export class ListBrandFoldersDto {
  @ApiPropertyOptional({ example: 1, description: 'Only folders owned by this user' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  createdBy?: number;

  @ApiPropertyOptional({ example: 1, description: 'Only direct children of this folder' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  headFolderId?: number;

  @ApiPropertyOptional({
    example: true,
    description: 'Only top-level folders. Takes priority over headFolderId.',
  })
  @IsOptional()
  @Transform(({ value }) => (value === 'true' ? true : value === 'false' ? false : value))
  @IsBoolean()
  topLevel?: boolean;
}
