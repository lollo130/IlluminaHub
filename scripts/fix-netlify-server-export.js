import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const buildDir = path.resolve(__dirname, '../build/server');
const indexPath = path.join(buildDir, 'index.js');
const serverPath = path.join(buildDir, 'server.js');
const serverCjsPath = path.join(buildDir, 'server.cjs');

try {
  if (fs.existsSync(indexPath) && !fs.existsSync(serverPath)) {
    fs.renameSync(indexPath, serverPath);
    console.log('✅ Ridenominato index.js -> server.js');
  }

  if (!fs.existsSync(serverPath)) {
    console.log('⚠️ Nessun file server.js trovato');
    process.exit(0);
  }

  const src = fs.readFileSync(serverPath, 'utf8');

  if (!/export\s+default/.test(src) && /(module\.exports|exports\.)/.test(src)) {
    fs.renameSync(serverPath, serverCjsPath);
    const wrapper = `import handler from './server.cjs';\nexport default handler;\n`;
    fs.writeFileSync(serverPath, wrapper, 'utf8');
    console.log('🚀 Creato wrapper ESM server.js per Netlify');
  } else {
    console.log('✅ server.js è già compatibile');
  }
} catch (err) {
  console.error('❌ Errore:', err);
  process.exit(1);
}