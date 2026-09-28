import { ApiProperty } from '@nestjs/swagger';
import { ASSET_TYPE_DESCRIPTION, ASSET_TYPE_IDS } from '../asset-types.js';

export class Asset {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Summer campaign banner' })
  name: string;

  @ApiProperty({ example: 1, enum: ASSET_TYPE_IDS, description: ASSET_TYPE_DESCRIPTION })
  type: number;

  @ApiProperty({ example: 'https://example.com/banner.png' })
  LogoURL: string;

  @ApiProperty({ example: null, nullable: true, type: Number, description: 'null means not in any folder' })
  FolderId: number | null;

  @ApiProperty({ example: 1 })
  createdBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ example: null, nullable: true, type: Date, description: 'Set when the asset is in the trash' })
  deletedAt: Date | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  tags: string | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  description: string | null;

  @ApiProperty({ example: null, nullable: true, type: String })
  usage_suggestion: string | null;
}
