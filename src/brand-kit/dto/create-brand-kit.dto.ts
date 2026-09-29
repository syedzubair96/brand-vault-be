import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, IsUrl, Matches, MaxLength } from 'class-validator';

const HEX_COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const HEX_MESSAGE = 'must be a hex color like #1A2B3C or #FFF';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class CreateBrandKitDto {
  @ApiProperty({ example: 'Acme Coffee', maxLength: 100 })
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  BrandName: string;

  @ApiProperty({ example: '#FFFFFF' })
  @IsString()
  @Matches(HEX_COLOR, { message: `PrimaryColor ${HEX_MESSAGE}` })
  PrimaryColor: string;

  @ApiProperty({ example: '#FFFFFF' })
  @IsString()
  @Matches(HEX_COLOR, { message: `SecondaryColor ${HEX_MESSAGE}` })
  SecondaryColor: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  @Transform(trim)
  @IsUrl({ require_protocol: true, protocols: ['http', 'https'] })
  LogoURL: string;
}
