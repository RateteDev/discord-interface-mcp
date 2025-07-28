import { describe, it, expect } from "@jest/globals";
import type { Locale, MessageKey, Messages, LocaleMessages } from "../../src/types/i18n";

describe("i18n types", () => {
  it("should allow valid locales", () => {
    const validLocales: Locale[] = ["ja", "en"];
    expect(validLocales).toHaveLength(2);
  });

  it("should define all message keys", () => {
    const messageKeys: MessageKey[] = [
      "waiting_for_response",
      "select_option",
      "message_sent",
      "processing",
      "completed",
      "error_occurred",
      "session_expired",
      "you_selected",
      "error_processing_feedback"
    ];
    expect(messageKeys).toHaveLength(9);
  });

  it("should type Messages correctly", () => {
    const messages: Messages = {
      waiting_for_response: "test",
      select_option: "test",
      message_sent: "test",
      processing: "test",
      completed: "test",
      error_occurred: "test",
      session_expired: "test",
      you_selected: "test",
      error_processing_feedback: "test"
    };
    expect(Object.keys(messages)).toHaveLength(9);
  });

  it("should type LocaleMessages correctly", () => {
    const localeMessages: LocaleMessages = {
      ja: {
        waiting_for_response: "テスト",
        select_option: "テスト",
        message_sent: "テスト",
        processing: "テスト",
        completed: "テスト",
        error_occurred: "テスト",
        session_expired: "テスト",
        you_selected: "テスト",
        error_processing_feedback: "テスト"
      },
      en: {
        waiting_for_response: "test",
        select_option: "test",
        message_sent: "test",
        processing: "test",
        completed: "test",
        error_occurred: "test",
        session_expired: "test",
        you_selected: "test",
        error_processing_feedback: "test"
      }
    };
    expect(Object.keys(localeMessages)).toHaveLength(2);
  });
});