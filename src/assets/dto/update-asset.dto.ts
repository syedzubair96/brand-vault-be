import { PartialType } from '@nestjs/swagger';
import { CreateAssetDto } from './create-asset.dto.js';

export class UpdateAssetDto extends PartialType(CreateAssetDto) {}
