import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { BrandFolderService } from './brand-folder.service.js';
import { CreateBrandFolderDto } from './dto/create-brand-folder.dto.js';
import { ListBrandFoldersDto } from './dto/list-brand-folders.dto.js';
import { UpdateBrandFolderDto } from './dto/update-brand-folder.dto.js';
import { BrandFolder } from './entities/brand-folder.entity.js';

@ApiTags('Folders')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@Controller('brand-folder')
export class BrandFolderController {
  constructor(private readonly brandFolderService: BrandFolderService) {}

  @Post()
  @ApiCreatedResponse({ type: BrandFolder })
  @ApiBadRequestResponse({ description: 'Validation failed or parent not found' })
  @ApiConflictResponse({ description: 'Folder name already exists' })
  create(@CurrentUser() user: AuthUser, @Body() createBrandFolderDto: CreateBrandFolderDto) {
    return this.brandFolderService.create(user.id, createBrandFolderDto);
  }

  @Get()
  @ApiOkResponse({ type: BrandFolder, isArray: true })
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListBrandFoldersDto) {
    return this.brandFolderService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOkResponse({ type: BrandFolder })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.brandFolderService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BrandFolder })
  @ApiBadRequestResponse({ description: 'Validation failed or invalid parent' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiConflictResponse({ description: 'Folder name already exists' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandFolderDto: UpdateBrandFolderDto,
  ) {
    return this.brandFolderService.update(user.id, id, updateBrandFolderDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: BrandFolder, description: 'Folder soft-deleted' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiConflictResponse({ description: 'Folder still has subfolders or assets' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.brandFolderService.remove(user.id, id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({ type: BrandFolder, description: 'Folder restored' })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiConflictResponse({ description: 'Folder is not deleted, or its parent is still deleted' })
  restore(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.brandFolderService.restore(user.id, id);
  }

  @Delete(':id/permanent')
  @ApiOkResponse({
    type: BrandFolder,
    description: 'Deleted folder and its trashed assets permanently removed',
  })
  @ApiNotFoundResponse({ description: 'Folder not found' })
  @ApiConflictResponse({
    description: 'Folder is not deleted, or still has subfolders or active assets',
  })
  removePermanently(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.brandFolderService.removePermanently(user.id, id);
  }
}
