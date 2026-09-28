import { OmitType, PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto.js';

export class UpdateAssetDto extends PartialType(
  OmitType(CreateAssetDto, ['createdBy'] as const),
) {}
