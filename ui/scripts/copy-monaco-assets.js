const { cpSync, existsSync, mkdirSync, rmSync } = require('fs');
const { dirname, join } = require('path');

const source = join(dirname(require.resolve('monaco-editor/package.json')), 'min', 'vs');
const destination = join(__dirname, '..', 'public', 'monaco-editor', 'vs');

if (!existsSync(source)) {
  throw new Error(`Monaco Editor assets were not found at ${source}`);
}

rmSync(destination, { recursive: true, force: true });
mkdirSync(destination, { recursive: true });
cpSync(source, destination, { recursive: true });

console.log(`Copied Monaco Editor assets to ${destination}`);
