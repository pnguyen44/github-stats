import fs from 'fs';

export function getConfig() {
  try {
    const data = fs.readFileSync('src/config.json', 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Error reading config file: ${error}`);
  }
}

const config = getConfig();
config.desiredDateFormat = 'YYYY-MM-DD h:mm:ss A';

export { config };
