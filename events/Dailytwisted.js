require('dotenv').config({ path: '.env.production' });
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch'); // for Node <18
const devUserId = process.env.DEV_USER_ID;
const webhookUrl = process.env.WEBHOOK_URL;
const channelId = process.env.DAILY_TWISTED_CHANNEL_ID; // private channel ID

function checkEmbedsBasic() {
  console.log('[DailyTwisted] Starting embed file check...');

  const embedsDir = path.join(__dirname, '..', 'embeds');

  if (!fs.existsSync(embedsDir)) {
    console.log('[DailyTwisted] Embeds folder not found:', embedsDir);
    return;
  }

  const files = fs.readdirSync(embedsDir).filter(file => file.endsWith('.json'));

  if (files.length === 0) {
    console.log('[DailyTwisted] No embed JSON files found.');
    return;
  }

  for (const file of files) {
    const filePath = path.join(embedsDir, file);

    try {
      const raw = fs.readFileSync(filePath, 'utf8').trim();
      if (!raw) {
        console.log(`[DailyTwisted] Skipping empty file: ${file}`);
        continue;
      }

      const data = JSON.parse(raw);

      if (data.embeds && Array.isArray(data.embeds) && data.embeds.length > 0) {
        console.log(`[DailyTwisted] ${file}: Has embeds`);
      } else {
        console.log(`[DailyTwisted] ${file}: No embeds found`);
      }
    } catch (err) {
      console.log(`[DailyTwisted] ${file}: Failed to read or parse (${err.message})`);
    }
  }

  console.log('[DailyTwisted] Embed check complete.');
}

// Sends prompt, waits for response, then sends embed via webhook
async function promptTwisted(client, channel) {
  try {
    const sentMessage = await channel.send("What Twisted is it today? (Please reply here)");

    const filter = m => m.author.id === devUserId && m.channel.id === channel.id;
    const collector = channel.createMessageCollector({ filter, max: 1, time: 10 * 60 * 1000 }); // 10 mins

    collector.on('collect', async message => {
      const response = message.content.trim().toLowerCase();

      await channel.send(`Got it! You said: "${response}"`);

      const embedsDir = path.join(__dirname, '..', 'embeds');
      const filePath = path.join(embedsDir, `${response}.json`);

      if (!fs.existsSync(filePath)) {
        channel.send(`Sorry, I couldn't find an embed for "${response}".`);
        console.log(`[DailyTwisted] No embed found for "${response}"`);
        return;
      }

      try {
        const raw = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(raw);

        if (!webhookUrl) {
          channel.send('Webhook URL is not configured.');
          console.error('[DailyTwisted] WEBHOOK_URL not set!');
          return;
        }

        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        });

        channel.send(`Embed for "${response}" sent to the webhook.`);
        console.log(`[DailyTwisted] Embed for "${response}" sent.`);
      } catch (err) {
        channel.send('Failed to read or parse embed file.');
        console.error(`[DailyTwisted] Error reading/parsing embed file: ${err}`);
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        channel.send("You didn't respond in time. Please try again later.");
        console.log('[DailyTwisted] No response received within time limit.');
      }
    });
  } catch (err) {
    console.error('[DailyTwisted] Error in promptTwisted:', err);
  }
}

// Main standby function that schedules the daily prompt at 8 PM and listens for manual test trigger
function standbyUntil8PM(client) {
  const askedToday = { date: null };

  // Listen for manual test trigger messages in the channel
  client.on('messageCreate', async message => {
    if (
      message.channel.id === channelId &&
      message.author.id === devUserId &&
      message.content.trim().toLowerCase() === '!testtwisted'
    ) {
      console.log('[DailyTwisted] Manual test triggered');
      await promptTwisted(client, message.channel);
    }
  });

  // Scheduled check for 8 PM prompt
  setInterval(async () => {
    const now = new Date();
    const estTime = now.toLocaleString("en-US", { timeZone: "America/New_York" });
    const estDate = new Date(estTime);
    const hours = estDate.getHours();
    const minutes = estDate.getMinutes();

    if (hours === 20 && minutes === 0) {
      const today = estDate.toDateString();
      if (askedToday.date !== today) {
        askedToday.date = today;

        try {
          const channel = await client.channels.fetch(channelId);
          if (!channel) {
            console.error('[DailyTwisted] Channel not found:', channelId);
            return;
          }

          await promptTwisted(client, channel);
        } catch (err) {
          console.error('[DailyTwisted] Error fetching channel or sending message:', err);
        }
      }
    }
  }, 60 * 1000); // check every minute
}

module.exports = {
  checkEmbedsBasic,
  standbyUntil8PM,
};
