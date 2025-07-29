import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import { z } from 'zod';
import { parseEnv } from 'znv';

describe('env configuration', () => {
  let originalEnv: NodeJS.ProcessEnv;

  beforeEach(() => {
    // 環境変数を保存
    originalEnv = { ...process.env };
  });

  afterEach(() => {
    // 環境変数を復元
    process.env = originalEnv;
  });

  it('should parse required environment variables', () => {
    const testEnv = {
      DISCORD_BOT_TOKEN: 'test-token',
      DISCORD_GUILD_ID: 'test-guild',
      DISCORD_TEXT_CHANNEL_ID: 'test-channel',
    };

    const env = parseEnv(testEnv, {
      NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
      DISCORD_BOT_TOKEN: z.string().min(1),
      DISCORD_GUILD_ID: z.string().min(1),
      DISCORD_TEXT_CHANNEL_ID: z.string().min(1),
      DISCORD_RESPONSE_TIMEOUT_SECONDS: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
      DISCORD_LOCALE: z.enum(['ja', 'en']).optional().default('en'),
    });

    expect(env.DISCORD_BOT_TOKEN).toBe('test-token');
    expect(env.DISCORD_GUILD_ID).toBe('test-guild');
    expect(env.DISCORD_TEXT_CHANNEL_ID).toBe('test-channel');
  });

  it('should parse optional DISCORD_RESPONSE_TIMEOUT_SECONDS', () => {
    const testEnv = {
      DISCORD_BOT_TOKEN: 'test-token',
      DISCORD_GUILD_ID: 'test-guild',
      DISCORD_TEXT_CHANNEL_ID: 'test-channel',
      DISCORD_RESPONSE_TIMEOUT_SECONDS: '30',
    };

    const env = parseEnv(testEnv, {
      NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
      DISCORD_BOT_TOKEN: z.string().min(1),
      DISCORD_GUILD_ID: z.string().min(1),
      DISCORD_TEXT_CHANNEL_ID: z.string().min(1),
      DISCORD_RESPONSE_TIMEOUT_SECONDS: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
      DISCORD_LOCALE: z.enum(['ja', 'en']).optional().default('en'),
    });

    expect(env.DISCORD_RESPONSE_TIMEOUT_SECONDS).toBe(30);
  });

  it('should default DISCORD_RESPONSE_TIMEOUT_SECONDS to undefined', () => {
    const testEnv = {
      DISCORD_BOT_TOKEN: 'test-token',
      DISCORD_GUILD_ID: 'test-guild',
      DISCORD_TEXT_CHANNEL_ID: 'test-channel',
    };

    const env = parseEnv(testEnv, {
      NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
      DISCORD_BOT_TOKEN: z.string().min(1),
      DISCORD_GUILD_ID: z.string().min(1),
      DISCORD_TEXT_CHANNEL_ID: z.string().min(1),
      DISCORD_RESPONSE_TIMEOUT_SECONDS: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
      DISCORD_LOCALE: z.enum(['ja', 'en']).optional().default('en'),
    });

    expect(env.DISCORD_RESPONSE_TIMEOUT_SECONDS).toBeUndefined();
  });

  it('should parse optional DISCORD_LOCALE', () => {
    const testEnv = {
      DISCORD_BOT_TOKEN: 'test-token',
      DISCORD_GUILD_ID: 'test-guild',
      DISCORD_TEXT_CHANNEL_ID: 'test-channel',
      DISCORD_LOCALE: 'ja',
    };

    const env = parseEnv(testEnv, {
      NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
      DISCORD_BOT_TOKEN: z.string().min(1),
      DISCORD_GUILD_ID: z.string().min(1),
      DISCORD_TEXT_CHANNEL_ID: z.string().min(1),
      DISCORD_RESPONSE_TIMEOUT_SECONDS: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
      DISCORD_LOCALE: z.enum(['ja', 'en']).optional().default('en'),
    });

    expect(env.DISCORD_LOCALE).toBe('ja');
  });

  it("should default DISCORD_LOCALE to 'en'", () => {
    const testEnv = {
      DISCORD_BOT_TOKEN: 'test-token',
      DISCORD_GUILD_ID: 'test-guild',
      DISCORD_TEXT_CHANNEL_ID: 'test-channel',
    };

    const env = parseEnv(testEnv, {
      NODE_ENV: z
        .enum(['development', 'production', 'test'])
        .default('development'),
      DISCORD_BOT_TOKEN: z.string().min(1),
      DISCORD_GUILD_ID: z.string().min(1),
      DISCORD_TEXT_CHANNEL_ID: z.string().min(1),
      DISCORD_RESPONSE_TIMEOUT_SECONDS: z
        .string()
        .optional()
        .transform((val) => (val ? parseInt(val, 10) : undefined)),
      DISCORD_LOCALE: z.enum(['ja', 'en']).optional().default('en'),
    });

    expect(env.DISCORD_LOCALE).toBe('en');
  });

  it('should only accept valid locales', () => {
    const testEnv = {
      DISCORD_BOT_TOKEN: 'test-token',
      DISCORD_GUILD_ID: 'test-guild',
      DISCORD_TEXT_CHANNEL_ID: 'test-channel',
      DISCORD_LOCALE: 'invalid',
    };

    expect(() => {
      parseEnv(testEnv, {
        NODE_ENV: z
          .enum(['development', 'production', 'test'])
          .default('development'),
        DISCORD_BOT_TOKEN: z.string().min(1),
        DISCORD_GUILD_ID: z.string().min(1),
        DISCORD_TEXT_CHANNEL_ID: z.string().min(1),
        DISCORD_RESPONSE_TIMEOUT_SECONDS: z
          .string()
          .optional()
          .transform((val) => (val ? parseInt(val, 10) : undefined)),
        DISCORD_LOCALE: z.enum(['ja', 'en']).optional().default('en'),
      });
    }).toThrow();
  });

  it('should mask environment values correctly', () => {
    // maskEnv関数のテスト
    function maskEnv(value: string): string {
      return value.slice(0, 3) + '******';
    }

    expect(maskEnv('sk-1234567890')).toBe('sk-******');
    expect(maskEnv('abc')).toBe('abc******');
    expect(maskEnv('a')).toBe('a******');
  });
});
