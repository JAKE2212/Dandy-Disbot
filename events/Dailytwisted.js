const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const embedsPath = path.join(__dirname, '..', 'embeds');

  try {
    const files = fs.readdirSync(embedsPath).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
      console.log('[🟡 Embed Loader] No embed JSON files found in /embeds.');
      return;
    }

    console.log(`[📦 Embed Loader] Loaded ${files.length} embed JSON file(s):`);

    files.forEach((file, index) => {
      const filePath = path.join(embedsPath, file);
      const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`  ${index + 1}. ${file} ✅`);

      // Optionally show preview of each embed
      if (json.embeds && json.embeds.length > 0) {
        const preview = json.embeds[0].description || '(no description)';
        console.log(`     ↳ Description: ${preview.substring(0, 60)}...`);
      }
    });

    console.log('[✅ Embed Loader] All embed files loaded successfully.\n');
  } catch (err) {
    console.error('[❌ Embed Loader] Failed to read embed folder:', err);
  }
};
