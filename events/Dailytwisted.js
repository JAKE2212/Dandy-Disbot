const fs = require('fs');
const path = require('path');

async function checkEmbedsBasic() {
  const embedsDir = path.join(__dirname, 'embeds'); // adjust path if needed

  if (!fs.existsSync(embedsDir)) {
    console.error('Embeds folder not found:', embedsDir);
    return;
  }

  const files = fs.readdirSync(embedsDir).filter(f => f.endsWith('.json'));

  if (files.length === 0) {
    console.log('No embed JSON files found.');
    return;
  }

  console.log(`Found ${files.length} JSON files:`);
  
  for (const file of files) {
    const filePath = path.join(embedsDir, file);
    try {
      const raw = fs.readFileSync(filePath, 'utf8').trim();
      if (!raw) {
        console.log(`- Skipping empty file: ${file}`);
        continue;
      }

      const data = JSON.parse(raw);
      if (data.embeds && Array.isArray(data.embeds) && data.embeds.length > 0) {
        console.log(`- ${file}: Has embeds`);
      } else {
        console.log(`- ${file}: No embeds found`);
      }
    } catch (err) {
      console.log(`- ${file}: Failed to parse JSON (${err.message})`);
    }
  }
}

module.exports = checkEmbedsBasic;

