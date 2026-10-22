import { mkdir, copyFile, cp } from 'node:fs/promises';
await mkdir('dist', { recursive: true });
for (const file of ['index.html', 'styles.css', 'app.js', 'game.js', 'puzzles.js', 'favicon.svg', 'favicon.ico', 'site.webmanifest']) {
  await copyFile(file, `dist/${file}`);
}
await cp('assets', 'dist/assets', { recursive: true, filter: source => !source.endsWith('.ttf') });
console.log('Built static site in dist/');
