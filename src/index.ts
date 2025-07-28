import { env, maskEnv } from "./utils/env";
import { DiscordBot } from "./discord/bot";
import { MCPServer } from "./mcp/server";

/**
 * アプリケーションのメインエントリポイント
 */
async function main() {
    try {
        console.error("[INFO] Discord Interface MCP starting...");
        console.error(`[INFO] Discord Bot Token: ${maskEnv(env.DISCORD_BOT_TOKEN)}`);
        console.error(`[INFO] Discord Guild ID: ${env.DISCORD_GUILD_ID}`);
        console.error(`[INFO] Discord Text Channel ID: ${env.DISCORD_TEXT_CHANNEL_ID}`);
        if (env.DISCORD_ALLOWED_ROLE_ID) {
            console.error(`[INFO] Discord Allowed Role ID: ${env.DISCORD_ALLOWED_ROLE_ID}`);
        } else {
            console.error("[INFO] Discord Role-based Access Control: Disabled (all users allowed)");
        }

        // Discord Bot の初期化
        const discordBot = new DiscordBot({
            token: env.DISCORD_BOT_TOKEN,
            guildId: env.DISCORD_GUILD_ID,
            textChannelId: env.DISCORD_TEXT_CHANNEL_ID,
            allowedRoleId: env.DISCORD_ALLOWED_ROLE_ID
        });

        // Discord Bot を開始
        await discordBot.start();

        // Bot の準備ができるまで待機
        await waitForBotReady(discordBot);

        // MCP サーバーの初期化
        const mcpServer = new MCPServer(discordBot);

        // MCP サーバーを開始
        await mcpServer.start();

        // グレースフルシャットダウンの設定
        setupGracefulShutdown(discordBot, mcpServer);

        console.error("[INFO] Discord Interface MCP is running successfully!");
    } catch (error) {
        console.error("[ERROR] Failed to start application:", error);
        process.exit(1);
    }
}

/**
 * Discord Bot の準備ができるまで待機
 * @param bot Discord Bot インスタンス
 * @param maxRetries 最大リトライ回数
 * @param retryDelay リトライ間隔（ミリ秒）
 */
async function waitForBotReady(bot: DiscordBot, maxRetries = 30, retryDelay = 1000): Promise<void> {
    let retries = 0;
    while (!bot.getIsReady() && retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        retries++;
    }
    
    if (!bot.getIsReady()) {
        throw new Error("Discord bot failed to become ready");
    }
    
    console.error("[INFO] Discord bot is ready!");
}

/**
 * グレースフルシャットダウンの設定
 * @param discordBot Discord Bot インスタンス
 * @param mcpServer MCP サーバーインスタンス
 */
function setupGracefulShutdown(discordBot: DiscordBot, mcpServer: MCPServer): void {
    const shutdown = async () => {
        console.error("[INFO] Shutting down gracefully...");
        
        try {
            await mcpServer.stop();
            await discordBot.stop();
            console.error("[INFO] Shutdown complete");
            process.exit(0);
        } catch (error) {
            console.error("[ERROR] Error during shutdown:", error);
            process.exit(1);
        }
    };

    process.on("SIGINT", shutdown);
    process.on("SIGTERM", shutdown);
}

// アプリケーションを開始
main().catch(error => {
    console.error("[ERROR] Unhandled error:", error);
    process.exit(1);
});
