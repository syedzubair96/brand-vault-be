import { ApiProperty } from '@nestjs/swagger';

export class BrandKit {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Acme Coffee' })
  BrandName: string;

  @ApiProperty({ example: '#6F4E37' })
  PrimaryColor: string;

  @ApiProperty({ example: '#F5E6CC' })
  SecondaryColor: string;

  @ApiProperty({ example: 'https://example.com/logo.png' })
  LogoURL: string;

  @ApiProperty({ example: 1 })
  createdBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
