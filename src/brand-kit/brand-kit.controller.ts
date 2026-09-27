import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BrandKitService } from './brand-kit.service.js';
import { CreateBrandKitDto } from './dto/create-brand-kit.dto.js';
import { UpdateBrandKitDto } from './dto/update-brand-kit.dto.js';
import { BrandKit } from './entities/brand-kit.entity.js';

@ApiTags('Brand Kit')
@Controller('brand-kit')
export class BrandKitController {
  constructor(private readonly brandKitService: BrandKitService) {}

  @Post()
  @ApiCreatedResponse({ type: BrandKit })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Brand name already exists' })
  create(@Body() createBrandKitDto: CreateBrandKitDto) {
    return this.brandKitService.create(createBrandKitDto);
  }

  @Get()
  @ApiOkResponse({ type: BrandKit, isArray: true })
  findAll() {
    return this.brandKitService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: BrandKit })
  @ApiNotFoundResponse({ description: 'Brand kit not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandKitService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BrandKit })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Brand kit not found' })
  @ApiConflictResponse({ description: 'Brand name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandKitDto: UpdateBrandKitDto,
  ) {
    return this.brandKitService.update(id, updateBrandKitDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: BrandKit })
  @ApiNotFoundResponse({ description: 'Brand kit not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandKitService.remove(id);
  }
}
