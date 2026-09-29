import { PartialType } from '@nestjs/swagger';
import { CreateBrandFolderDto } from './create-brand-folder.dto.js';

export class UpdateBrandFolderDto extends PartialType(CreateBrandFolderDto) {}
