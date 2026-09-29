import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import {
  BadGatewayException,
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ASSET_SUGGESTION_SCHEMA,
  formatAiResponse,
  type AssetSuggestionResult,
  type AssetTaggingInput,
} from './asset-suggestion.js';

const DEFAULT_MODEL = 'gpt-4o-mini';
const DEFAULT_BASE_URL = 'https://api.openai.com/v1';
const DEFAULT_TIMEOUT_MS = 30_000;
const PROMPT_PATH = resolve(process.cwd(), 'prompts/asset-tagging.md');

const VIEWABLE_TYPES = new Set(['image', 'logo']);
// OpenAI vision reads PNG, JPEG, WEBP and non-animated GIF; these are known not to work.
const UNSUPPORTED_IMAGE_EXTENSION = /\.(svgz?|tiff?|bmp|ico|heic|heif|avif|psd|ai|eps|pdf)$/i;
const IMAGE_DETAILS = new Set(['low', 'high', 'auto']);

interface ChatCompletionResponse {
  choices?: { message?: { content?: string | null; refusal?: string | null } }[];
}

/** The provider rejected the request while an image was attached (usually it couldn't fetch it). */
class ImageRejectedError extends Error {}

@Injectable()
export class AssetTaggingService {
  private readonly logger = new Logger(AssetTaggingService.name);
  private prompt: Promise<string> | null = null;

  constructor(private readonly config: ConfigService) {}

  async suggest(input: AssetTaggingInput): Promise<AssetSuggestionResult> {
    const apiKey = this.config.get<string>('OPENAI_API_KEY');
    if (!apiKey) {
      throw new ServiceUnavailableException('AI tagging is not configured on the server');
    }

    const imageUrl = this.viewableImageUrl(input);
    let usedImage = imageUrl !== null;
    let content: string;
    try {
      content = await this.complete(apiKey, input, imageUrl);
    } catch (error) {
      if (!(error instanceof ImageRejectedError)) throw error;
      this.logger.warn(`AI provider could not use the image at ${imageUrl}; retrying without it`);
      usedImage = false;
      content = await this.complete(apiKey, input, null);
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = null;
    }
    const suggestion = formatAiResponse(parsed);
    if (!suggestion) {
      this.logger.warn(`Rejected invalid AI suggestion: ${content.slice(0, 500)}`);
      throw new BadGatewayException('The AI returned an invalid suggestion. Please try again.');
    }
    return { ...suggestion, used_image: usedImage };
  }

  /** The asset URL if the model should look at the image itself, otherwise null. */
  private viewableImageUrl(input: AssetTaggingInput): string | null {
    if (this.config.get<string>('AI_VISION') === 'false') return null;
    if (!VIEWABLE_TYPES.has(input.asset.type)) return null;
    try {
      const url = new URL(input.asset.url);
      if (url.protocol !== 'https:' || UNSUPPORTED_IMAGE_EXTENSION.test(url.pathname)) return null;
      return url.toString();
    } catch {
      return null;
    }
  }

  private buildUserMessage(input: AssetTaggingInput, imageUrl: string | null) {
    const text = JSON.stringify({ ...input, image_attached: imageUrl !== null });
    if (!imageUrl) return text;

    const configuredDetail = this.config.get<string>('AI_IMAGE_DETAIL') ?? 'low';
    const detail = IMAGE_DETAILS.has(configuredDetail) ? configuredDetail : 'low';
    return [
      { type: 'text', text },
      { type: 'image_url', image_url: { url: imageUrl, detail } },
    ];
  }

  private async complete(apiKey: string, input: AssetTaggingInput, imageUrl: string | null): Promise<string> {
    const baseUrl = (this.config.get<string>('OPENAI_BASE_URL') ?? DEFAULT_BASE_URL).replace(/\/+$/, '');
    const model = this.config.get<string>('OPENAI_MODEL') ?? DEFAULT_MODEL;
    const timeoutMs = Number(this.config.get<string>('AI_TIMEOUT_MS')) || DEFAULT_TIMEOUT_MS;

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/chat/completions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model,
          temperature: 0.2,
          messages: [
            { role: 'system', content: await this.loadPrompt() },
            { role: 'user', content: this.buildUserMessage(input, imageUrl) },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: { name: 'asset_suggestion', strict: true, schema: ASSET_SUGGESTION_SCHEMA },
          },
        }),
        signal: AbortSignal.timeout(timeoutMs),
      });
    } catch (error) {
      console.log("Error in AI request:", error);
      this.logger.error(`AI request failed: ${error instanceof Error ? error.message : String(error)}`);
      throw new BadGatewayException('Could not reach the AI provider. Please try again.');
    }

    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      this.logger.error(`AI provider returned ${response.status}: ${detail.slice(0, 500)}`);
      if (response.status === 400 && imageUrl) {
        throw new ImageRejectedError(detail);
      }
      if (response.status === 429) {
        throw new ServiceUnavailableException(
          'The AI provider rate limit or quota was reached. Please try again later.',
        );
      }
      throw new BadGatewayException('The AI provider request failed. Please try again.');
    }

    const body = (await response.json().catch(() => null)) as ChatCompletionResponse | null;
    const message = body?.choices?.[0]?.message;
    if (!message?.content || message.refusal) {
      this.logger.warn(`AI returned no usable content${message?.refusal ? `: ${message.refusal}` : ''}`);
      throw new BadGatewayException('The AI returned an invalid suggestion. Please try again.');
    }
    return message.content;
  }

  private loadPrompt() {
    this.prompt ??= readFile(PROMPT_PATH, 'utf8').catch((error: unknown) => {
      this.prompt = null;
      throw error;
    });
    return this.prompt;
  }
}
