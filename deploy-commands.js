const dotenv = require("dotenv");
const envFile =
  process.env.NODE_ENV === "production"
    ? ".env.production"
    : ".env.development";
dotenv.config({ path: envFile });

const { REST, Routes } = require("discord.js");
const fs = require("node:fs");
const path = require("node:path");

const commands = [];

const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ("data" in command && "execute" in command) {
      // ✅ Skip dev-only commands when in production
      if (process.env.NODE_ENV === "production" && command.devOnly) continue;

      commands.push(command.data.toJSON());
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

// Prepare REST instance
const rest = new REST().setToken(process.env.DISCORD_TOKEN);

// Deploy commands
(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands.`
    );

    if (process.env.NODE_ENV === "development") {
      if (!process.env.GUILD_ID)
        throw new Error("Missing GUILD_ID in development environment.");

      const guildData = await rest.put(
        Routes.applicationGuildCommands(
          process.env.CLIENT_ID,
          process.env.GUILD_ID
        ),
        { body: commands }
      );
      console.log(
        `✅ Successfully reloaded ${guildData.length} GUILD commands.`
      );
    } else {
      const globalData = await rest.put(
        Routes.applicationCommands(process.env.CLIENT_ID),
        { body: commands }
      );
      console.log(
        `✅ Successfully reloaded ${globalData.length} GLOBAL commands. (May take up to 1 hour)`
      );
    }
  } catch (error) {
    console.error("❌ Deployment error:", error);
  }
})();

if (process.env.NODE_ENV === "development") {
  console.log(
    "Running in development mode. Commands are deployed to the specified guild only."
  );
}
