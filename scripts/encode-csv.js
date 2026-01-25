/**
 * 将 CSV 文件编码为 Base64
 * 用法: node scripts/encode-csv.js
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '../src/data');

// 需要编码的 CSV 文件
const csvFiles = [
  'general-dive-log-summaries.csv',
  'general-dive-log-samples.csv',
  'general-dive-log-tanks.csv',
  'general-dive-log-exporter-version.csv',
];

console.log('Encoding CSV files to Base64...\n');

csvFiles.forEach(file => {
  const inputPath = join(dataDir, file);
  const outputPath = join(dataDir, file.replace('.csv', '.b64'));
  
  try {
    const content = readFileSync(inputPath, 'utf-8');
    const encoded = Buffer.from(content).toString('base64');
    writeFileSync(outputPath, encoded);
    console.log(`✓ ${file} → ${file.replace('.csv', '.b64')} (${encoded.length} chars)`);
  } catch (err) {
    console.log(`✗ ${file}: ${err.message}`);
  }
});

console.log('Done!');
