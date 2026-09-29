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
import { BrandKitService } from './brand-kit.service.js';
import { CreateBrandKitDto } from './dto/create-brand-kit.dto.js';
import { UpdateBrandKitDto } from './dto/update-brand-kit.dto.js';
import { BrandKit } from './entities/brand-kit.entity.js';

@ApiTags('Brand Kit')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@Controller('brand-kit')
export class BrandKitController {
  constructor(private readonly brandKitService: BrandKitService) {}

  @Post()
  @ApiCreatedResponse({ type: BrandKit })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Brand name already exists' })
  create(@CurrentUser() user: AuthUser, @Body() createBrandKitDto: CreateBrandKitDto) {
    return this.brandKitService.create(user.id, createBrandKitDto);
  }

  @Get()
  @ApiOkResponse({ type: BrandKit, isArray: true })
  findAll(@CurrentUser() user: AuthUser) {
    return this.brandKitService.findAll(user.id);
  }

  @Get(':id')
  @ApiOkResponse({ type: BrandKit })
  @ApiNotFoundResponse({ description: 'Brand kit not found' })
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.brandKitService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: BrandKit })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Brand kit not found' })
  @ApiConflictResponse({ description: 'Brand name already exists' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBrandKitDto: UpdateBrandKitDto,
  ) {
    return this.brandKitService.update(user.id, id, updateBrandKitDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: BrandKit })
  @ApiNotFoundResponse({ description: 'Brand kit not found' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.brandKitService.remove(user.id, id);
  }
}
