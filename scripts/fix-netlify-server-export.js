import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const buildDir = path.resolve(__dirname, '../build/server');
const indexPath = path.join(buildDir, 'index.js');
const serverPath = path.join(buildDir, 'server.js');

try {
  // 1. Rinomina se necessario
  if (fs.existsSync(indexPath) && !fs.existsSync(serverPath)) {
    fs.renameSync(indexPath, serverPath);
    console.log('✅ Ridenominato index.js -> server.js');
  }

  if (!fs.existsSync(serverPath)) {
    console.error('❌ server.js non trovato!');
    process.exit(1);
  }

  let content = fs.readFileSync(serverPath, 'utf8');

  // 2. Applica la "Toppa di Compatibilità" (Shim)
  // Questa riga assicura che ci sia un export default valido per Netlify
  const shim = `
// --- Netlify Compatibility Shim ---
if (typeof module !== "undefined" && module.exports) {
  module.exports.default = module.exports.default || module.exports;
}
export default (typeof module !== "undefined" && module.exports && module.exports.default) 
  ? module.exports.default 
  : null;
`;

  if (!content.includes('Netlify Compatibility Shim')) {
    fs.appendFileSync(serverPath, shim, 'utf8');
    console.log('🚀 Applicata toppa di compatibilità default export per Netlify');
  } else {
    console.log('✅ La toppa è già presente.');
  }

} catch (err) {
  console.error('❌ Errore durante il fix:', err);
  process.exit(1);
}