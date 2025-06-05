const dotenv = require('dotenv');
const envFile = process.env.NODE_ENV === 'production' ? '.env.production' : '.env.development';
dotenv.config({ path: envFile });

const fs = require('node:fs');
const path = require('node:path');
const fetch = require('node-fetch'); // add this if your Node version <18

const { Client, Collection, GatewayIntentBits } = require('discord.js');

const client = new Client({ 
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

client.commands = new Collection();

const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			client.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (message.channel.id !== process.env.DAILY_TWISTED_CHANNEL_ID) return;
  if (message.author.id !== process.env.DEV_USER_ID) return;

  if (message.content.toLowerCase() === 'testtwisted') {
    try {
      const response = 'your-twisted-embed-name'; // customize as needed
      
      const embedsDir = path.join(__dirname, 'embeds');
      const filePath = path.join(embedsDir, `${response}.json`);

      if (!fs.existsSync(filePath)) {
        return message.channel.send(`Sorry, I couldn't find an embed for "${response}".`);
      }

      const raw = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(raw);

      if (!process.env.WEBHOOK_URL) {
        return message.channel.send('Webhook URL is not configured.');
      }

      await fetch(process.env.WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      message.channel.send(`Embed for "${response}" sent to the webhook.`);
    } catch (err) {
      console.error(err);
      message.channel.send('There was an error trying to send the embed.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);