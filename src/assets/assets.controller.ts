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
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AssetsService } from './assets.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { ListAssetsDto } from './dto/list-assets.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';
import { Asset } from './entities/asset.entity.js';

@ApiTags('Assets')
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiCreatedResponse({ type: Asset })
  @ApiBadRequestResponse({ description: 'Validation failed or folder not found' })
  @ApiConflictResponse({ description: 'Asset name already exists' })
  create(@Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'List active assets, or trashed ones with trash=true' })
  @ApiOkResponse({ type: Asset, isArray: true })
  findAll(@Query() query: ListAssetsDto) {
    return this.assetsService.findAll(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found or in the trash' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an asset or move it to another folder' })
  @ApiOkResponse({ type: Asset })
  @ApiBadRequestResponse({ description: 'Validation failed or folder not found' })
  @ApiNotFoundResponse({ description: 'Asset not found or in the trash' })
  @ApiConflictResponse({ description: 'Asset name already exists' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Post(':id/trash')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move an asset to the trash (soft delete)' })
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found or already in the trash' })
  trash(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.trash(id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Restore an asset from the trash',
    description: 'If its folder was deleted meanwhile, the asset is restored outside any folder.',
  })
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found' })
  @ApiConflictResponse({ description: 'Asset is not in the trash' })
  restore(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.restore(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete an asset that is in the trash' })
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found' })
  @ApiConflictResponse({ description: 'Asset is not in the trash' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.assetsService.remove(id);
  }
}
