import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'rolldown';

// Portable review only. Production keeps fonts/assets separate and loads
// Three.js on demand; this offline file deliberately embeds the whole bundle.
const root = resolve(import.meta.dirname, '..');
const assets = resolve(root, 'dist/assets');
const cssName = (await readdir(assets)).find(name => /^index-.*\.css$/.test(name));
if (!cssName) throw new Error('Run npm run build before preparing the review.');
let css = await readFile(resolve(assets, cssName), 'utf8');
const assetUrls = [...new Set([...css.matchAll(/url\(([^)]+)\)/g)].map(match => match[1].replace(/['"]/g, '')))];
for (const url of assetUrls) {
  if (!url.startsWith('/assets/')) continue;
  const name = url.slice('/assets/'.length);
  const bytes = await readFile(resolve(assets, name));
  const mime = name.endsWith('.woff2') ? 'font/woff2' : 'font/woff';
  css = css.replaceAll(url, `data:${mime};base64,${bytes.toString('base64')}`);
}
const result = await build({
  cwd: root, input: resolve(root, 'script.js'), write: false,
  transform: { define: { 'import.meta.env.DEV': 'false' } },
  output: { format: 'iife', codeSplitting: false, minify: true },
});
const js = result.output.filter(item => item.type === 'chunk').map(item => item.code).join('\n');
let html = await readFile(resolve(root, 'index.html'), 'utf8');
html = html.replace(/<link[^>]*rel="stylesheet"[^>]*>/g, () => `<style>${css}</style>`);
html = html.replace(/<script[^>]*src="[^"]+"[^>]*><\/script>/g, '');
for (const name of ['gateway-static.webp', 'gateway-mobile.webp']) {
  const bytes = await readFile(resolve(root, 'public/assets', name));
  html = html.replaceAll(`/assets/${name}`, `data:image/webp;base64,${bytes.toString('base64')}`);
}
html = html.replace('</body>', () => `<script>${js.replace(/<\/script/gi, '<\\/script')}</script></body>`);
const destination = resolve(root, 'review');
await mkdir(destination, { recursive: true });
const path = resolve(destination, 'MIZAJ_Clarity_Gateway_Review.html');
await writeFile(path, html);
console.log(`Portable review: ${path} (${Buffer.byteLength(html)} bytes)`);
