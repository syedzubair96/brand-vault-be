import { BadGatewayException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AssetTaggingInput } from './asset-suggestion.js';
import { AssetTaggingService } from './asset-tagging.service.js';

const input: AssetTaggingInput = {
  asset: { name: 'Summer banner', type: 'image', url: 'https://cdn.example.com/summer-banner.png' },
  folder: { name: 'Social Media' },
  brand: null,
};

function service(env: Record<string, string | undefined> = { OPENAI_API_KEY: 'sk-test' }) {
  return new AssetTaggingService({ get: (key: string) => env[key] } as unknown as ConfigService);
}

function mockOpenAi(status: number, body: unknown) {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(typeof body === 'string' ? body : JSON.stringify(body), { status }),
  );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

function completion(content: string) {
  return { choices: [{ message: { content, refusal: null } }] };
}

const SUGGESTION = JSON.stringify({
  tags: ['Summer', 'banner'],
  description: 'A banner.',
  usage_suggestion: 'Web banners.',
});

function requestBody(fetchMock: ReturnType<typeof vi.fn>, call = 0) {
  return JSON.parse((fetchMock.mock.calls[call] as [string, RequestInit])[1].body as string);
}

describe('AssetTaggingService', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns 503 without calling the provider when no API key is configured', async () => {
    const fetchMock = mockOpenAi(200, {});

    await expect(service({}).suggest(input)).rejects.toBeInstanceOf(ServiceUnavailableException);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the prompt, the asset details and a strict JSON schema, and returns the validated suggestion', async () => {
    const documentInput: AssetTaggingInput = {
      ...input,
      asset: { name: 'Brand guidelines', type: 'document', url: 'https://cdn.example.com/guidelines.pdf' },
    };
    const fetchMock = mockOpenAi(200, completion(SUGGESTION));

    await expect(service().suggest(documentInput)).resolves.toEqual({
      tags: ['summer', 'banner'],
      description: 'A banner.',
      usage_suggestion: 'Web banners.',
      used_image: false,
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.openai.com/v1/chat/completions');
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk-test');
    const body = requestBody(fetchMock);
    expect(body.messages[0].content).toContain('Use only facts present in the input');
    expect(JSON.parse(body.messages[1].content)).toEqual({ ...documentInput, image_attached: false });
    expect(body.response_format.json_schema.strict).toBe(true);
  });

  describe('image viewing', () => {
    it('attaches the image for image assets', async () => {
      const fetchMock = mockOpenAi(200, completion(SUGGESTION));

      await expect(service().suggest(input)).resolves.toMatchObject({ used_image: true });

      const [text, image] = requestBody(fetchMock).messages[1].content;
      expect(JSON.parse(text.text)).toEqual({ ...input, image_attached: true });
      expect(image).toEqual({
        type: 'image_url',
        image_url: { url: 'https://cdn.example.com/summer-banner.png', detail: 'low' },
      });
    });

    it('attaches the image for logo assets, with the configured detail', async () => {
      const fetchMock = mockOpenAi(200, completion(SUGGESTION));
      const logo = { ...input, asset: { ...input.asset, type: 'logo', url: 'https://cdn.example.com/logo.webp' } };

      await service({ OPENAI_API_KEY: 'sk-test', AI_IMAGE_DETAIL: 'high' }).suggest(logo);

      expect(requestBody(fetchMock).messages[1].content[1].image_url.detail).toBe('high');
    });

    it.each([
      ['a video', { type: 'video', url: 'https://cdn.example.com/clip.mp4' }],
      ['an SVG', { type: 'logo', url: 'https://cdn.example.com/logo.svg' }],
      ['a non-https URL', { type: 'image', url: 'http://cdn.example.com/banner.png' }],
    ])('does not attach %s', async (_label, asset) => {
      const fetchMock = mockOpenAi(200, completion(SUGGESTION));

      await expect(
        service().suggest({ ...input, asset: { ...input.asset, ...asset } }),
      ).resolves.toMatchObject({ used_image: false });
      expect(typeof requestBody(fetchMock).messages[1].content).toBe('string');
    });

    it('does not attach images when AI_VISION is false', async () => {
      const fetchMock = mockOpenAi(200, completion(SUGGESTION));

      await expect(
        service({ OPENAI_API_KEY: 'sk-test', AI_VISION: 'false' }).suggest(input),
      ).resolves.toMatchObject({ used_image: false });
      expect(typeof requestBody(fetchMock).messages[1].content).toBe('string');
    });

    it('retries without the image when the provider cannot use it', async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          new Response(JSON.stringify({ error: { code: 'invalid_image_url' } }), { status: 400 }),
        )
        .mockResolvedValueOnce(new Response(JSON.stringify(completion(SUGGESTION)), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);

      await expect(service().suggest(input)).resolves.toMatchObject({ used_image: false });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const retry = JSON.parse((fetchMock.mock.calls[1] as [string, RequestInit])[1].body as string);
      expect(JSON.parse(retry.messages[1].content)).toEqual({ ...input, image_attached: false });
    });
  });

  it('rejects output that is not JSON', async () => {
    mockOpenAi(200, completion('Here are some tags: summer, banner'));

    await expect(service().suggest(input)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('rejects JSON with the wrong shape', async () => {
    mockOpenAi(200, completion(JSON.stringify({ tags: 'summer', description: 'x' })));

    await expect(service().suggest(input)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('rejects a refusal', async () => {
    mockOpenAi(200, { choices: [{ message: { content: null, refusal: 'I cannot help with that.' } }] });

    await expect(service().suggest(input)).rejects.toBeInstanceOf(BadGatewayException);
  });

  it('maps a provider 429 (rate limit or no quota) to 503', async () => {
    mockOpenAi(429, { error: { code: 'insufficient_quota' } });

    await expect(service().suggest(input)).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('maps other provider errors to 502', async () => {
    mockOpenAi(401, { error: { message: 'Incorrect API key' } });

    await expect(service().suggest(input)).rejects.toBeInstanceOf(BadGatewayException);
  });
});
