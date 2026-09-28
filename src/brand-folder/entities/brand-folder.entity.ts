import { ApiProperty } from '@nestjs/swagger';

export class BrandFolder {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Social Media' })
  FolderName: string;

  @ApiProperty({
    example: null,
    nullable: true,
    type: Number,
    description: 'null means a top-level folder',
  })
  HeadFolderId: number | null;

  @ApiProperty({ example: 1 })
  createdBy: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    example: null,
    nullable: true,
    type: Date,
    description: 'null means the folder is not deleted',
  })
  deletedAt: Date | null;
}
