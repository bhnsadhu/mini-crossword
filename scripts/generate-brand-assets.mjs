import { Resvg } from '@resvg/resvg-js';
import { mkdir, writeFile } from 'node:fs/promises';

// Shared geometry and palette for the header, browser icons, and link preview.
const paper = '#faf9f6', green = '#314a39', ink = '#242c27', blue = '#dce9f3', yellow = '#f3d575';
const font = { loadSystemFonts: false, fontFiles: ['assets/fonts/Inter.ttf'], defaultFontFamily: 'Inter' };
const svg = (w, h, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${body}</svg>`;
const mark = `<rect width="48" height="48" rx="10" fill="${green}"/>` + Array.from({length:9}, (_,i) => {
  if (i === 0 || i === 8) return '';
  return `<rect x="${10 + i % 3 * 10}" y="${10 + Math.floor(i / 3) * 10}" width="8" height="8" fill="${i === 4 ? yellow : paper}"/>`;
}).join('');
const wordmark = `<text x="62" y="40" font-family="Inter" font-weight="550" font-size="44" letter-spacing="-1.5" fill="${green}">mini</text>`;
const logo = svg(150, 48, mark + wordmark);
const icon = svg(48, 48, mark);
const render = (source, size) => new Resvg(source, { font, ...(size ? {fitTo:{mode:'width',value:size}} : {}) });
await mkdir('assets', {recursive:true});
await writeFile('favicon.svg', icon + '\n');
await writeFile('assets/logo.svg', render(logo).toString() + '\n');
await writeFile('assets/logo.png', render(logo, 600).render().asPng());
for (const [file,size] of [['favicon-32.png',32],['apple-touch-icon.png',180],['icon-192.png',192],['icon-512.png',512]]) {
  await writeFile(`assets/${file}`, render(icon,size).render().asPng());
}
// ICO embeds 16, 32, and 48 pixel PNG frames for browsers that request /favicon.ico.
const frames = [16,32,48].map(size => ({size,png:render(icon,size).render().asPng()}));
const header = Buffer.alloc(6 + 16 * frames.length); header.writeUInt16LE(1,2); header.writeUInt16LE(frames.length,4);
let offset = header.length;
frames.forEach(({size,png},i) => { const p=6+16*i; header[p]=size; header[p+1]=size; header.writeUInt16LE(1,p+4); header.writeUInt16LE(32,p+6); header.writeUInt32LE(png.length,p+8); header.writeUInt32LE(offset,p+12); offset += png.length; });
await writeFile('favicon.ico', Buffer.concat([header,...frames.map(f=>f.png)]));
// The preview shows the real grid geometry without giving away any answers.
const blocks = new Set([0,4,20,24]);
const numbers = {1:1,2:2,3:3,5:4,9:5,10:6,15:7,21:8};
const grid = `<rect width="360" height="360" fill="${ink}"/>` + Array.from({length:25},(_,i)=> {
  const x=2+(i%5)*71.6, y=2+Math.floor(i/5)*71.6;
  if(blocks.has(i)) return '';
  const fill=i===1?yellow:i===2||i===3?blue:'#fff';
  return `<rect x="${x}" y="${y}" width="69.6" height="69.6" fill="${fill}"/>` + (numbers[i]?`<text x="${x+6}" y="${y+17}" font-family="Inter" font-size="13" fill="${ink}">${numbers[i]}</text>`:'');
}).join('');
const preview = svg(1200,630, `<rect width="1200" height="630" fill="${paper}"/><g transform="translate(80 70)">${mark}${wordmark}</g><text x="80" y="280" font-family="Inter" font-size="58" font-weight="500" letter-spacing="-1.5" fill="${ink}">Mini crossword</text><text x="80" y="330" font-family="Inter" font-size="24" fill="${green}">A daily 5 × 5 puzzle.</text><text x="80" y="552" font-family="Inter" font-size="19" fill="${green}">minicrossword.bhanusadhu.com</text><g transform="translate(760 135)">${grid}</g>`);
await writeFile('assets/share-preview.svg', render(preview).toString() + '\n');
await writeFile('assets/share-preview.png', render(preview).render().asPng());
console.log('Generated logo, favicon, touch icons, and 1200 × 630 sharing image.');
