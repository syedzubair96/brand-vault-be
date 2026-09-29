import { ApiProperty } from '@nestjs/swagger';

export class AssetSuggestionEntity {
  @ApiProperty({ example: ['campaign', 'social', 'banner'] })
  tags: string[];

  @ApiProperty({ example: 'Summer campaign banner image for the Social Media folder.' })
  description: string;

  @ApiProperty({ example: 'Suitable for social posts or website banners.' })
  usage_suggestion: string;

  @ApiProperty({
    example: true,
    description: 'true when the AI looked at the image itself, not only the name, type, URL, folder and brand',
  })
  used_image: boolean;
}
