import { PartialType } from '@nestjs/swagger';
import { CreateBrandKitDto } from './create-brand-kit.dto.js';

export class UpdateBrandKitDto extends PartialType(CreateBrandKitDto) {}
