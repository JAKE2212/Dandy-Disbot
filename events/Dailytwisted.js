const fs = require('fs');
const path = require('path');

module.exports = async () => {
  const embedsPath = path.join(__dirname, '..', 'embeds');

  console.log('[Embed Loader] Starting up...');

  try {
    if (!fs.existsSync(embedsPath)) {
      console.error('[Embed Loader] Folder not found: /embeds');
      return;
    }

    const files = fs.readdirSync(embedsPath).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
      console.log('[Embed Loader] No JSON files found in /embeds.');
      return;
    }

    console.log(`[Embed Loader] Found ${files.length} embed file(s):`);

    files.forEach((file, index) => {
      const filePath = path.join(embedsPath, file);
      try {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        console.log(`- (${index + 1}) ${file} loaded.`);
      } catch (err) {
        console.error(`[Embed Loader] Failed to parse ${file}:`, err.message);
      }
    });

    console.log('[Embed Loader] All available embeds processed.');
  } catch (err) {
    console.error('[Embed Loader] Fatal error while reading embeds:', err.message);
  }
};

