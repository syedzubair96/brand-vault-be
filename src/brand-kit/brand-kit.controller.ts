import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BrandKitService } from './brand-kit.service.js';
import { CreateBrandKitDto } from './dto/create-brand-kit.dto.js';
import { UpdateBrandKitDto } from './dto/update-brand-kit.dto.js';

@Controller('brand-kit')
export class BrandKitController {
  constructor(private readonly brandKitService: BrandKitService) {}

  @Post()
  create(@Body() createBrandKitDto: CreateBrandKitDto) {
    return this.brandKitService.create(createBrandKitDto);
  }

  @Get()
  findAll() {
    return this.brandKitService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.brandKitService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBrandKitDto: UpdateBrandKitDto) {
    return this.brandKitService.update(+id, updateBrandKitDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.brandKitService.remove(+id);
  }
}
