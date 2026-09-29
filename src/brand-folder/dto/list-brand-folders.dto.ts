import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsInt, IsOptional, IsPositive } from 'class-validator';

const toBoolean = ({ value }: { value: unknown }) =>
  value === 'true' ? true : value === 'false' ? false : value;

export class ListBrandFoldersDto {
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
  @Transform(toBoolean)
  @IsBoolean()
  topLevel?: boolean;

  @ApiPropertyOptional({
    example: false,
    description: 'true lists deleted folders instead of active ones',
  })
  @IsOptional()
  @Transform(toBoolean)
  @IsBoolean()
  trash?: boolean;
}
