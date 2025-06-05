const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testingdailyembed')
    .setDescription('Sends the test embed to the dev webhook'),

  devOnly: true,

  async execute(interaction) {
    const webhookUrl = process.env.WEBHOOK_URL;

    if (!webhookUrl) {
      console.error('❌ WEBHOOK_URL not defined!');
      return interaction.reply({
        content: 'Webhook URL not found in environment variables.',
        flags: MessageFlags.Ephemeral
      });
    }

    const filePath = path.join(__dirname, '..', '..', 'embeds', 'test.json');
    if (!fs.existsSync(filePath)) {
      console.error('❌ test.json not found!');
      return interaction.reply({
        content: 'test.json file not found.',
        flags: MessageFlags.Ephemeral
      });
    }

    const embedData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    console.log('📦 Sending webhook payload:', JSON.stringify(embedData, null, 2));

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(embedData) // ✅ send the whole JSON as-is
      });

      console.log('📬 Webhook response:', response.status, response.statusText);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Discord API error:', errorText);
      }

      await interaction.reply({ 
        content: '✅ Test embed sent to dev webhook!',
        flags: MessageFlags.Ephemeral
      });
    } catch (err) {
      console.error('❌ Failed to send test embed:', err);
      await interaction.reply({ 
        content: '❌ Failed to send test embed.', 
        flags: MessageFlags.Ephemeral 
      });
    }
  }
};

