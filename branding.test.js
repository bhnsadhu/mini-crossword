import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const html = await readFile('index.html', 'utf8');
const meta = name => html.match(new RegExp(`<meta (?:property|name)="${name}" content="([^"]+)"`))?.[1];

test('sharing metadata points at a real public PNG with matching dimensions', async () => {
  assert.equal(meta('og:type'), 'website');
  assert.equal(meta('og:url'), 'https://minicrossword.bhanusadhu.com/');
  assert.equal(meta('twitter:card'), 'summary_large_image');
  const url = new URL(meta('og:image'));
  assert.equal(url.origin, 'https://minicrossword.bhanusadhu.com');
  assert.equal(meta('twitter:image'), url.href);
  assert.ok(meta('og:image:alt'));
  const png = await readFile(`.${url.pathname}`);
  assert.equal(png.subarray(1,4).toString(), 'PNG');
  assert.equal(png.readUInt32BE(16), Number(meta('og:image:width')));
  assert.equal(png.readUInt32BE(20), Number(meta('og:image:height')));
  assert.equal(png.readUInt32BE(16), 1200);
  assert.equal(png.readUInt32BE(20), 630);
});

test('browser and installed app icons exist at their declared sizes', async () => {
  const manifest = JSON.parse(await readFile('site.webmanifest','utf8'));
  for (const { src, sizes } of [...manifest.icons, {src:'/assets/apple-touch-icon.png',sizes:'180x180'}, {src:'/assets/favicon-32.png',sizes:'32x32'}]) {
    const png = await readFile(`.${src}`);
    assert.equal(`${png.readUInt32BE(16)}x${png.readUInt32BE(20)}`, sizes);
  }
  const ico = await readFile('favicon.ico');
  assert.equal(ico.readUInt16LE(2), 1);
  assert.equal(ico.readUInt16LE(4), 3);
  const logo = await readFile('assets/logo.svg','utf8');
  assert.ok(logo.includes('<path'), 'logo lettering uses embedded geometry');
  assert.ok(!logo.includes('<text'), 'logo does not depend on font loading');
});
