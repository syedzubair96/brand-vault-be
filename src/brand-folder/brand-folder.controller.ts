import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BrandFolderService } from './brand-folder.service.js';
import { CreateBrandFolderDto } from './dto/create-brand-folder.dto.js';
import { ListBrandFoldersDto } from './dto/list-brand-folders.dto.js';
import { UpdateBrandFolderDto } from './dto/update-brand-folder.dto.js';
import { BrandFolder } from './entities/brand-folder.entity.js';

@ApiTags('Folders')
@Controller('brand-folder')
export class BrandFolderController {
  constructor(private readonly brandFolderService: BrandFolderService) {}

  @Post()
  @ApiCreatedResponse({ type: BrandFolder })
  @ApiBadRequestResponse({ description: 'Validation failed or parent not found' })
  @ApiConflictResponse({ description: 'Folder name already exists' })
  create(@Body() createBrandFolderDto: CreateBrandFolderDto) {
    return this.brandFolderService.create(createBrandFolderDto);
  }

  @Get()
  @ApiOkResponse({ type: BrandFolder, isArray: true })
  findAll(@Query() query: ListBrandFoldersDto) {
    return this.brandFolderService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: BrandFolder })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.brandFolderService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BrandFolder })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid parent' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiConflictResponse({ description: 'Folder name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandFolderDto: UpdateBrandFolderDto,
  ) {
    return this.brandFolderService.update(id, updateBrandFolderDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: BrandFolder, description: 'Folder soft-deleted' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiConflictResponse({ description: 'Folder still has subfolders' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.brandFolderService.remove(id);
  }
}
