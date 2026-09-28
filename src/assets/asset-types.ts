export const ASSET_TYPES = {
  1: 'image',
  2: 'video',
  3: 'logo',
  4: 'document',
  5: 'font',
} as const;

export const ASSET_TYPE_IDS = Object.keys(ASSET_TYPES).map(Number);

export const ASSET_TYPE_DESCRIPTION = Object.entries(ASSET_TYPES)
  .map(([id, name]) => `${id} = ${name}`)
  .join(', ');
