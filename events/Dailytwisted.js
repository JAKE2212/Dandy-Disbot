const fs = require('fs');
const path = require('path');

module.exports = async () => {
  // ✅ Only run in development
  if (process.env.NODE_ENV !== 'development') {
    console.log('🛑 Skipping embed loader (not in development mode)');
    return;
  }

  const embedsPath = path.join(__dirname, '..', 'embeds');

  try {
    const files = fs.readdirSync(embedsPath).filter(file => file.endsWith('.json'));

    if (files.length === 0) {
      console.log('📂 No embed JSON files found.');
      return;
    }

    console.log(`📦 Found ${files.length} embed JSON files:`);

    files.forEach((file, index) => {
      const filePath = path.join(embedsPath, file);
      const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      console.log(`🗂️  [${index + 1}] ${file} loaded:`);
      console.dir(json, { depth: null });
    });

  } catch (err) {
    console.error('❌ Error reading embed folder:', err);
  }
};
