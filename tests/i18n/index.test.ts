import { describe, it, expect, beforeEach } from "@jest/globals";
import { i18n, setLocale, getLocale, t } from "../../src/i18n";

describe("i18n system", () => {
  beforeEach(() => {
    // 各テストの前にロケールをリセット
    setLocale("en");
  });

  describe("locale management", () => {
    it("should default to English", () => {
      expect(getLocale()).toBe("en");
    });

    it("should allow setting Japanese locale", () => {
      setLocale("ja");
      expect(getLocale()).toBe("ja");
    });

    it("should allow setting English locale", () => {
      setLocale("en");
      expect(getLocale()).toBe("en");
    });
  });

  describe("message translation", () => {
    describe("English messages", () => {
      beforeEach(() => {
        setLocale("en");
      });

      it("should return English waiting message", () => {
        expect(t("waiting_for_response")).toBe("💬 Waiting for your response...");
      });

      it("should return English select option message", () => {
        expect(t("select_option")).toBe("👆 Please select an option");
      });

      it("should return English message sent", () => {
        expect(t("message_sent")).toBe("✅ Message sent");
      });

      it("should return English processing message", () => {
        expect(t("processing")).toBe("⏳ Processing...");
      });

      it("should return English completed message", () => {
        expect(t("completed")).toBe("✅ Completed");
      });

      it("should return English error message", () => {
        expect(t("error_occurred")).toBe("❌ An error occurred");
      });

      it("should return English session expired message", () => {
        expect(t("session_expired")).toBe("❌ This feedback session has expired.");
      });

      it("should return English you selected message", () => {
        expect(t("you_selected")).toBe("✅ You Selected");
      });

      it("should return English error processing feedback", () => {
        expect(t("error_processing_feedback")).toBe("An error occurred while processing your feedback.");
      });

      it("should return English ty for reply message", () => {
        expect(t("ty_for_reply")).toBe("ty for reply❤️");
      });

      it("should return English selected message", () => {
        expect(t("selected")).toBe("selected");
      });
    });

    describe("Japanese messages", () => {
      beforeEach(() => {
        setLocale("ja");
      });

      it("should return Japanese waiting message", () => {
        expect(t("waiting_for_response")).toBe("💬 返信をお待ちしています...");
      });

      it("should return Japanese select option message", () => {
        expect(t("select_option")).toBe("👆 選択してください");
      });

      it("should return Japanese message sent", () => {
        expect(t("message_sent")).toBe("✅ メッセージを送信しました");
      });

      it("should return Japanese processing message", () => {
        expect(t("processing")).toBe("⏳ 処理中...");
      });

      it("should return Japanese completed message", () => {
        expect(t("completed")).toBe("✅ 完了しました");
      });

      it("should return Japanese error message", () => {
        expect(t("error_occurred")).toBe("❌ エラーが発生しました");
      });

      it("should return Japanese session expired message", () => {
        expect(t("session_expired")).toBe("❌ このフィードバックセッションは期限切れです。");
      });

      it("should return Japanese you selected message", () => {
        expect(t("you_selected")).toBe("✅ 選択しました");
      });

      it("should return Japanese error processing feedback", () => {
        expect(t("error_processing_feedback")).toBe("フィードバックの処理中にエラーが発生しました。");
      });

      it("should return Japanese ty for reply message", () => {
        expect(t("ty_for_reply")).toBe("返信ありがとうございます❤️");
      });

      it("should return Japanese selected message", () => {
        expect(t("selected")).toBe("選択済み");
      });
    });
  });

  describe("initialization from environment", () => {
    it("should initialize with environment locale if set", () => {
      // この部分は実装時に環境変数から読み込むようにする
      const originalEnv = process.env.DISCORD_LOCALE;
      process.env.DISCORD_LOCALE = "ja";
      
      // i18nシステムを再初期化
      const { initializeI18n } = require("../../src/i18n");
      initializeI18n();
      
      expect(getLocale()).toBe("ja");
      
      // 環境変数を元に戻す
      process.env.DISCORD_LOCALE = originalEnv;
    });
  });
});