/* This block of code defines mappings for Twisted toon keys, display names, aliases, and image URLs.
Here's a breakdown of what each part does: */
const { SlashCommandBuilder, MessageFlags } = require("discord.js");
const fs = require("fs");
const path = require("path");

// Maps internal toon keys to display names
const toonDisplayNames = {
  Brightney: "Brightney",
  Connie: "Connie",
  Finn: "Finn",
  Rnd: "Razzle and Dazzle",
  Rodger: "Rodger",
  Teagan: "Teagan",
  Toodles: "Toodles",
  Blot: "Blot",
  Flutter: "Flutter",
  Gigi: "Gigi",
  Glisten: "Glisten",
  Goob: "Goob",
  Scraps: "Scraps",
  Astro: "Astro",
  Pebble: "Pebble",
  Vee: "Vee",
  Shelly: "Shelly",
  Sprout: "Sprout",
};

// Maps aliases (user input) to internal keys
const inputAliases = {
  rnd: "Rnd",
  razzle: "Rnd",
  dazzle: "Rnd",
  // Add more aliases if needed
};

const toonImages = {
  Brightney:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/c/ce/Twisted_Brightney_Full_Render.png/revision/latest/scale-to-width-down/1000?cb=20240830061428",
  Connie:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/7/73/Twisted_Connie_Full_Render.png/revision/latest?cb=20241206183455",
  Finn: "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/2/2d/Twisted_Finn_Full_Render.png/revision/latest?cb=20240830061710",
  Rnd: "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/b/b0/Twisted_Razzle_%26_Dazzle_Full_Render.png/revision/latest?cb=20240830061521",
  Rodger:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/9/92/Twisted_Rodger_Full_Render.png/revision/latest?cb=20240826161057",
  Teagan:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/7/7a/Twisted_Teagan_Full_Render.png/revision/latest?cb=20240830061609",
  Toodles:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/7/7a/Twisted_Teagan_Full_Render.png/revision/latest?cb=20240830061609",
  Blot: "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/a/ab/Twisted_Blot_Full_Render.png/revision/latest?cb=20250523190457",
  Flutter:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/5f/Twisted_Flutter_Full_Render.png/revision/latest?cb=20240823022638",
  Gigi: "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/f/f7/Twisted_Gigi_Full_Render.png/revision/latest/scale-to-width-down/1000?cb=20240929232139",
  Glisten:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/d/d9/Twisted_Glisten_Full_Render.png/revision/latest?cb=20240817204946",
  Goob: "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/2/2e/Twisted_Goob_Full_Render.png/revision/latest?cb=20240830061834",
  Scraps:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/3/3f/Twisted_Scraps_Full_Render.png/revision/latest?cb=20240826161257",
  Astro:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/a/ae/Twisted_Astro_Full_Render.png/revision/latest?cb=20240823020010",
  Pebble:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/8/8e/Twisted_Pebble_Full_Render.png/revision/latest?cb=20240823014644",
  Vee: "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/4/45/Twisted_Vee_Full_Render.png/revision/latest/scale-to-width-down/1000?cb=20240823005023",
  Shelly:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/b/b6/Twisted_Shelly_Full_Render.png/revision/latest?cb=20240830061958",
  Sprout:
    "https://static.wikia.nocookie.net/dandys-world-robloxhorror/images/5/5b/Twisted_Sprout_Full_Render.png/revision/latest/scale-to-width-down/1000?cb=20240820173449",
};

module.exports = {
  data: new SlashCommandBuilder()
    .setName("twisted-of-the-day")
    .setDescription("Send today's Twisted toon")
    .addStringOption((option) =>
      option
        .setName("toon")
        .setDescription("The name of the toon")
        .setRequired(true)
    ),

  async execute(interaction) {
    const userInput = interaction.options.getString("toon");
    const toonInput = userInput.toLowerCase(); // normalize for alias lookup

    // 1. Resolve to internal key
    const toonKey =
      inputAliases[toonInput] ||
      Object.keys(toonImages).find((key) => key.toLowerCase() === toonInput);

    // 2. Validate
    if (!toonKey || !toonImages[toonKey]) {
      return interaction.reply({
        content: `I don't have an image for **${userInput}**. Please update the image list.`,
        flags: MessageFlags.Ephemeral,
      });
    }

    // 3. Get display name + image
    const displayName = toonDisplayNames[toonKey] || toonKey;
    const imageUrl = toonImages[toonKey];
    const today = new Date().toLocaleDateString("en-US", {
      timeZone: "America/New_York",
    });
    const webhookUrl = process.env.DAILY_TWISTED_WEBHOOK_URL;

    if (!webhookUrl) {
      return interaction.reply({
        content: "Webhook is not configured in `.env`.",
        flags: MessageFlags.Ephemeral,
      });
    }

    // 4. Load embed template
    const templatePath = path.join(
      __dirname,
      "..",
      "..",
      "embeds",
      "template.json"
    );
    if (!fs.existsSync(templatePath)) {
      return interaction.reply({
        content: "Embed template not found.",
        flags: MessageFlags.Ephemeral,
      });
    }

    const raw = fs.readFileSync(templatePath, "utf8");
    const json = JSON.parse(raw);

    // 5. Modify embed
    const modified = {
      ...json,
      embeds: json.embeds.map((embed) => ({
        ...embed,
        title: embed.title
          ?.replace("{{toon}}", displayName)
          .replace("{{date}}", today),
        description: embed.description
          ?.replace("{{toon}}", displayName)
          ?.replace("{{date}}", today),
        image: { url: imageUrl },
      })),
    };

    // 6. Send to webhook
    try {
      await fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(modified),
      });

      await interaction.reply({
        content: `Sent **${displayName}** to the daily twisted channel.`,
        flags: MessageFlags.Ephemeral,
      });
    } catch (err) {
      console.error("[Webhook Error]", err);
      await interaction.reply({
        content: "Failed to send embed to webhook.",
        flags: MessageFlags.Ephemeral,
      });
    }
  },
};
