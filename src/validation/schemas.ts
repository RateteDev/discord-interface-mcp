import { z } from 'zod';

/**
 * Embedフィールドのスキーマ
 */
export const FieldSchema = z.object({
  name: z.string(),
  value: z.string(),
  inline: z.boolean().optional(),
});

/**
 * ボタンのスキーマ
 */
export const ButtonSchema = z.object({
  label: z
    .string()
    .min(1, 'ラベルは1文字以上である必要があります')
    .max(80, 'ラベルは80文字以下である必要があります'),
  value: z
    .string()
    .min(1, '値は1文字以上である必要があります')
    .max(100, '値は100文字以下である必要があります'),
});

/**
 * send_textchannel_message引数のスキーマ
 */
export const SendTextChannelMessageArgsSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  fields: z.array(FieldSchema).optional(),
});

/**
 * create_thread引数のスキーマ
 */
export const CreateThreadArgsSchema = z.object({
  threadName: z
    .string()
    .min(1, 'スレッド名は1文字以上である必要があります')
    .max(100, 'スレッド名は100文字以下である必要があります'),
  initialMessage: z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    fields: z.array(FieldSchema).optional(),
  }),
});

/**
 * send_thread_message引数のスキーマ
 */
export const SendThreadMessageArgsSchema = z
  .object({
    threadId: z.string(),
    title: z.string().optional(),
    description: z.string().optional(),
    fields: z.array(FieldSchema).optional(),
    waitForResponse: z
      .object({
        type: z.enum(['text', 'button']),
        buttons: z
          .array(ButtonSchema)
          .min(1, '少なくとも1つのボタンが必要です')
          .max(5, '最大5つまでのボタンが許可されています')
          .optional(),
      })
      .optional(),
  })
  .refine(
    (data) => {
      if (
        data.waitForResponse?.type === 'button' &&
        !data.waitForResponse.buttons
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'ボタンタイプの応答を待つ場合、buttonsフィールドは必須です',
      path: ['waitForResponse', 'buttons'],
    }
  );

/**
 * get_threads引数のスキーマ
 */
export const GetThreadsArgsSchema = z.object({
  filter: z.enum(['all', 'active', 'archived']).optional(),
});

/**
 * get_thread_messages引数のスキーマ
 */
export const GetThreadMessagesArgsSchema = z.object({
  threadId: z.string().min(1, 'スレッドIDは必須です'),
  limit: z.number().min(1).max(100).optional().default(50),
  before: z.string().optional(),
  after: z.string().optional(),
  includeEmbeds: z.boolean().optional().default(true),
  includeAttachments: z.boolean().optional().default(true),
});
