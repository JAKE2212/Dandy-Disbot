const fs = require('fs');
const path = require('path');

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

module.exports = checkEmbedsBasic;

