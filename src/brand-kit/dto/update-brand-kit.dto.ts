import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateBrandKitDto } from './create-brand-kit.dto.js';

export class UpdateBrandKitDto extends PartialType(
  OmitType(CreateBrandKitDto, ['createdBy'] as const),
) {}
