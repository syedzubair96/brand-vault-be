import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBrandFolderDto } from './create-brand-folder.dto.js';

export class UpdateBrandFolderDto extends PartialType(
  OmitType(CreateBrandFolderDto, ['createdBy'] as const),
) {}
