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
  Put,
  Query,
} from '@nestjs/common';
import {
  ApiBadGatewayResponse,
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiServiceUnavailableResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { AuthUser } from '../auth/auth-user.js';
import { CurrentUser } from '../auth/decorators/current-user.decorator.js';
import { AssetsService } from './assets.service.js';
import { CreateAssetDto } from './dto/create-asset.dto.js';
import { ListAssetsDto } from './dto/list-assets.dto.js';
import { SaveAiMetadataDto } from './dto/save-ai-metadata.dto.js';
import { UpdateAssetDto } from './dto/update-asset.dto.js';
import { AssetSuggestionEntity } from './entities/asset-suggestion.entity.js';
import { Asset } from './entities/asset.entity.js';

@ApiTags('Assets')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Missing or invalid access token' })
@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post()
  @ApiCreatedResponse({ type: Asset })
  @ApiBadRequestResponse({ description: 'Validation failed or folder not found' })
  @ApiConflictResponse({ description: 'Asset name already exists' })
  create(@CurrentUser() user: AuthUser, @Body() createAssetDto: CreateAssetDto) {
    return this.assetsService.create(user.id, createAssetDto);
  }

  @Get()
  @ApiOperation({ summary: 'List active assets, or trashed ones with trash=true' })
  @ApiOkResponse({ type: Asset, isArray: true })
  findAll(@CurrentUser() user: AuthUser, @Query() query: ListAssetsDto) {
    return this.assetsService.findAll(user.id, query);
  }

  @Get(':id')
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found or in the trash' })
  findOne(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.assetsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Edit an asset or move it to another folder' })
  @ApiOkResponse({ type: Asset })
  @ApiBadRequestResponse({ description: 'Validation failed or folder not found' })
  @ApiNotFoundResponse({ description: 'Asset not found or in the trash' })
  @ApiConflictResponse({ description: 'Asset name already exists' })
  update(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAssetDto: UpdateAssetDto,
  ) {
    return this.assetsService.update(user.id, id, updateAssetDto);
  }

  @Post(':id/trash')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Move an asset to the trash (soft delete)' })
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found or already in the trash' })
  trash(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.assetsService.trash(user.id, id);
  }

  @Post(':id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore an asset from the trash' })
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found' })
  @ApiConflictResponse({ description: 'Asset is not in the trash' })
  restore(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.assetsService.restore(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Permanently delete an asset that is in the trash' })
  @ApiOkResponse({ type: Asset })
  @ApiNotFoundResponse({ description: 'Asset not found' })
  @ApiConflictResponse({ description: 'Asset is not in the trash' })
  remove(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.assetsService.remove(user.id, id);
  }

  @Post(':id/ai-suggestion')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate AI tags, description and usage suggestion (not saved)',
    description:
      'Sends the asset name, type, URL, folder name and brand profile to the AI provider and returns a validated suggestion for the user to review. Save it with PUT /assets/{id}/ai-metadata.',
  })
  @ApiOkResponse({ type: AssetSuggestionEntity })
  @ApiNotFoundResponse({ description: 'Asset not found or in the trash' })
  @ApiBadGatewayResponse({ description: 'AI provider failed or returned invalid output' })
  @ApiServiceUnavailableResponse({ description: 'AI is not configured, or the provider quota was reached' })
  suggestAiMetadata(@CurrentUser() user: AuthUser, @Param('id', ParseIntPipe) id: number) {
    return this.assetsService.suggestAiMetadata(user.id, id);
  }

  @Put(':id/ai-metadata')
  @ApiOperation({ summary: 'Save reviewed tags, description and usage suggestion on the asset' })
  @ApiOkResponse({ type: Asset })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'Asset not found or in the trash' })
  saveAiMetadata(
    @CurrentUser() user: AuthUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: SaveAiMetadataDto,
  ) {
    return this.assetsService.saveAiMetadata(user.id, id, dto);
  }
}
