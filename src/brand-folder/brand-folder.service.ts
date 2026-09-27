import { Injectable } from '@nestjs/common';
import { CreateBrandFolderDto } from './dto/create-brand-folder.dto.js';
import { UpdateBrandFolderDto } from './dto/update-brand-folder.dto.js';

@Injectable()
export class BrandFolderService {
  create(createBrandFolderDto: CreateBrandFolderDto) {
    return 'This action adds a new brandFolder';
  }

  findAll() {
    return `This action returns all brandFolder`;
  }

  findOne(id: number) {
    return `This action returns a #${id} brandFolder`;
  }

  update(id: number, updateBrandFolderDto: UpdateBrandFolderDto) {
    return `This action updates a #${id} brandFolder`;
  }

  remove(id: number) {
    return `This action removes a #${id} brandFolder`;
  }
}
