import { describe, expect, it } from "bun:test";
import { 
    ColorNameSchema, 
    FeedbackButtonSchema, 
    SendDiscordEmbedArgsSchema,
    SendDiscordEmbedWithFeedbackArgsSchema,
    colorNameToHex 
} from "../../src/validation/schemas";

describe("ColorNameSchema", () => {
    const validColors = [
        "black", "silver", "gray", "white", "maroon", "red", "purple", "fuchsia",
        "green", "lime", "olive", "yellow", "navy", "blue", "teal", "aqua"
    ];

    const invalidColors = [
        "orange", "pink", "brown", "darkgreen", "lightblue", "", "RED", "Blue", "123"
    ];

    describe("有効な色名", () => {
        validColors.forEach(color => {
            it(`${color} を受け入れる`, () => {
                expect(() => ColorNameSchema.parse(color)).not.toThrow();
            });
        });
    });

    describe("無効な色名", () => {
        invalidColors.forEach(color => {
            it(`${color} を拒否する`, () => {
                expect(() => ColorNameSchema.parse(color)).toThrow();
            });
        });
    });
});

describe("colorNameToHex", () => {
    it("CSS基本16色を正しい16進値に変換する", () => {
        expect(colorNameToHex("black")).toBe(0x000000);
        expect(colorNameToHex("white")).toBe(0xFFFFFF);
        expect(colorNameToHex("red")).toBe(0xFF0000);
        expect(colorNameToHex("green")).toBe(0x008000);
        expect(colorNameToHex("blue")).toBe(0x0000FF);
        expect(colorNameToHex("yellow")).toBe(0xFFFF00);
        expect(colorNameToHex("aqua")).toBe(0x00FFFF);
        expect(colorNameToHex("fuchsia")).toBe(0xFF00FF);
        expect(colorNameToHex("lime")).toBe(0x00FF00);
        expect(colorNameToHex("maroon")).toBe(0x800000);
        expect(colorNameToHex("navy")).toBe(0x000080);
        expect(colorNameToHex("olive")).toBe(0x808000);
        expect(colorNameToHex("purple")).toBe(0x800080);
        expect(colorNameToHex("silver")).toBe(0xC0C0C0);
        expect(colorNameToHex("teal")).toBe(0x008080);
        expect(colorNameToHex("gray")).toBe(0x808080);
    });

    it("無効な色名に対してエラーを投げる", () => {
        expect(() => colorNameToHex("orange" as any)).toThrow();
        expect(() => colorNameToHex("" as any)).toThrow();
    });
});

describe("FeedbackButtonSchema", () => {
    describe("有効なボタン", () => {
        it("基本的なボタンを受け入れる", () => {
            const validButton = { label: "Yes", value: "yes" };
            expect(() => FeedbackButtonSchema.parse(validButton)).not.toThrow();
        });

        it("最大長のラベルと値を受け入れる", () => {
            const validButton = {
                label: "A".repeat(80),
                value: "a".repeat(100)
            };
            expect(() => FeedbackButtonSchema.parse(validButton)).not.toThrow();
        });

        it("英数字とアンダースコアの値を受け入れる", () => {
            const validButton = { label: "Option", value: "option_1_test" };
            expect(() => FeedbackButtonSchema.parse(validButton)).not.toThrow();
        });

        it("日本語などの多言語文字を受け入れる", () => {
            const validButtons = [
                { label: "はい", value: "はい" },
                { label: "Sí", value: "si" },
                { label: "Да", value: "да" },
                { label: "是", value: "是" }
            ];
            
            validButtons.forEach(button => {
                expect(() => FeedbackButtonSchema.parse(button)).not.toThrow();
            });
        });
    });

    describe("無効なボタン", () => {
        it("空のラベルを拒否する", () => {
            const invalidButton = { label: "", value: "yes" };
            expect(() => FeedbackButtonSchema.parse(invalidButton)).toThrow();
        });

        it("長すぎるラベルを拒否する", () => {
            const invalidButton = { label: "A".repeat(81), value: "yes" };
            expect(() => FeedbackButtonSchema.parse(invalidButton)).toThrow();
        });

        it("空の値を拒否する", () => {
            const invalidButton = { label: "Yes", value: "" };
            expect(() => FeedbackButtonSchema.parse(invalidButton)).toThrow();
        });

        it("長すぎる値を拒否する", () => {
            const invalidButton = { label: "Yes", value: "a".repeat(101) };
            expect(() => FeedbackButtonSchema.parse(invalidButton)).toThrow();
        });

    });
});

describe("SendDiscordEmbedArgsSchema", () => {
    describe("有効な引数", () => {
        it("色名を含む完全なEmbedを受け入れる", () => {
            const validArgs = {
                title: "Test Title",
                description: "Test Description",
                color: "red",
                fields: [
                    { name: "Field 1", value: "Value 1", inline: true },
                    { name: "Field 2", value: "Value 2" }
                ]
            };
            
            const result = SendDiscordEmbedArgsSchema.parse(validArgs);
            expect(result.color).toBe(0xFF0000); // red
        });

        it("最小限のEmbedを受け入れる", () => {
            const validArgs = {};
            expect(() => SendDiscordEmbedArgsSchema.parse(validArgs)).not.toThrow();
        });

        it("フィールドなしのEmbedを受け入れる", () => {
            const validArgs = {
                title: "Title Only",
                color: "blue"
            };
            
            const result = SendDiscordEmbedArgsSchema.parse(validArgs);
            expect(result.color).toBe(0x0000FF); // blue
        });
    });

    describe("無効な引数", () => {
        it("無効な色名を拒否する", () => {
            const invalidArgs = {
                title: "Test",
                color: "orange"
            };
            expect(() => SendDiscordEmbedArgsSchema.parse(invalidArgs)).toThrow();
        });

        it("無効なフィールド構造を拒否する", () => {
            const invalidArgs = {
                title: "Test",
                fields: [
                    { name: "Field 1" } // valueが欠落
                ]
            };
            expect(() => SendDiscordEmbedArgsSchema.parse(invalidArgs)).toThrow();
        });
    });
});

describe("SendDiscordEmbedWithFeedbackArgsSchema", () => {
    describe("有効な引数", () => {
        it("デフォルトボタンを使用", () => {
            const validArgs = {
                title: "Feedback Test",
                feedbackPrompt: "Please choose:"
            };
            
            const result = SendDiscordEmbedWithFeedbackArgsSchema.parse(validArgs);
            expect(result.feedbackButtons).toEqual([
                { label: "Yes", value: "yes" },
                { label: "No", value: "no" }
            ]);
        });

        it("カスタムボタンを受け入れる", () => {
            const validArgs = {
                title: "Custom Feedback",
                feedbackButtons: [
                    { label: "Agree", value: "agree" },
                    { label: "Disagree", value: "disagree" },
                    { label: "Neutral", value: "neutral" }
                ]
            };
            
            const result = SendDiscordEmbedWithFeedbackArgsSchema.parse(validArgs);
            expect(result.feedbackButtons).toHaveLength(3);
        });

        it("最大5つのボタンを受け入れる", () => {
            const validArgs = {
                title: "Max Buttons",
                feedbackButtons: [
                    { label: "1", value: "one" },
                    { label: "2", value: "two" },
                    { label: "3", value: "three" },
                    { label: "4", value: "four" },
                    { label: "5", value: "five" }
                ]
            };
            
            expect(() => SendDiscordEmbedWithFeedbackArgsSchema.parse(validArgs)).not.toThrow();
        });
    });

    describe("無効な引数", () => {
        it("6つ以上のボタンを拒否する", () => {
            const invalidArgs = {
                title: "Too Many Buttons",
                feedbackButtons: [
                    { label: "1", value: "one" },
                    { label: "2", value: "two" },
                    { label: "3", value: "three" },
                    { label: "4", value: "four" },
                    { label: "5", value: "five" },
                    { label: "6", value: "six" }
                ]
            };
            
            expect(() => SendDiscordEmbedWithFeedbackArgsSchema.parse(invalidArgs)).toThrow();
        });

        it("空のボタン配列を拒否する", () => {
            const invalidArgs = {
                title: "No Buttons",
                feedbackButtons: []
            };
            
            expect(() => SendDiscordEmbedWithFeedbackArgsSchema.parse(invalidArgs)).toThrow();
        });

        it("重複する値を拒否する", () => {
            const invalidArgs = {
                title: "Duplicate Values",
                feedbackButtons: [
                    { label: "Yes", value: "yes" },
                    { label: "Confirm", value: "yes" }
                ]
            };
            
            expect(() => SendDiscordEmbedWithFeedbackArgsSchema.parse(invalidArgs)).toThrow();
        });
    });
});