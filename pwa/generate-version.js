import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(__dirname, 'package.json');
const outputPath = path.join(__dirname, 'public', 'version.js');

try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const content = `// Generated automatically by generate-version.js. Do not edit.\nwindow.PWA_VERSION = '${pkg.version}';\n`;
    fs.writeFileSync(outputPath, content, 'utf8');
    console.log(`[Version Generator] Generated public/version.js with version: ${pkg.version}`);
} catch (err) {
    console.error('[Version Generator] Failed to generate version.js:', err);
    process.exit(1);
}
