export interface AssetSuggestion {
  tags: string[];
  description: string;
  usage_suggestion: string;
}

export interface AssetSuggestionResult extends AssetSuggestion {
  /** Whether the model was shown the image itself, not only the asset's text details. */
  used_image: boolean;
}

export interface AssetTaggingInput {
  asset: { name: string; type: string; url: string };
  folder: { name: string } | null;
  brand: { name: string; primary_color: string; secondary_color: string } | null;
}

/** JSON schema sent to the model (OpenAI Structured Outputs, strict mode). */
export const ASSET_SUGGESTION_SCHEMA = {
  type: 'object',
  additionalProperties: false,
  required: ['tags', 'description', 'usage_suggestion'],
  properties: {
    tags: {
      type: 'array',
      items: { type: 'string' },
      description: `short lowercase keywords`,
    },
    description: { type: 'string' },
    usage_suggestion: { type: 'string' },
  },
} as const;

export function normalizeTag(tag: string) {
  return tag.trim().replace(/^#+/, '').replace(/\s+/g, ' ').toLowerCase();
}


export function formatAiResponse(raw: unknown): AssetSuggestion | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null;
  const record = raw as Record<string, unknown>;

  const keys = Object.keys(record);
  //checking response contains the right content
  if (keys.length !== 3 || !['tags', 'description', 'usage_suggestion'].every((k) => keys.includes(k))) {
    return null;
  }

  const { tags, description, usage_suggestion } = record;

  if (!Array.isArray(tags) || typeof description !== 'string' || typeof usage_suggestion !== 'string') {
    return null;
  }
  if (!tags.every((t): t is string => typeof t === 'string')) return null;


  const cleanTags = [...new Set(tags.map(normalizeTag))];

  const cleanDescription = description.trim();
  const cleanUsage = usage_suggestion.trim();
  
  if (!cleanDescription) return null;
  if (!cleanUsage) return null;

  return { tags: cleanTags, description: cleanDescription, usage_suggestion: cleanUsage };
}
