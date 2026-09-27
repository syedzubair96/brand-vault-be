import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BrandFolderService } from './brand-folder.service.js';
import { CreateBrandFolderDto } from './dto/create-brand-folder.dto.js';
import { UpdateBrandFolderDto } from './dto/update-brand-folder.dto.js';

@Controller('brand-folder')
export class BrandFolderController {
  constructor(private readonly brandFolderService: BrandFolderService) {}

  @Post()
  create(@Body() createBrandFolderDto: CreateBrandFolderDto) {
    return this.brandFolderService.create(createBrandFolderDto);
  }

  @Get()
  findAll() {
    return this.brandFolderService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandFolderService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandFolderDto: UpdateBrandFolderDto) {
    return this.brandFolderService.update(+id, updateBrandFolderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandFolderService.remove(+id);
  }
}
