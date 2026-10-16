import fs from 'fs';

try {
  const html = fs.readFileSync('scripts/ideabrowser_page.html', 'utf8');
  const match = html.match(/<script id="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/);
  if (match) {
    console.log('Found __NEXT_DATA__!');
    const data = JSON.parse(match[1]);
    const idea = data.props?.pageProps?.idea || data.props?.pageProps;
    console.log('Idea object keys:', Object.keys(idea || {}));
    fs.writeFileSync('scripts/ideabrowser_data.json', JSON.stringify(idea, null, 2), 'utf8');
    console.log('Saved to scripts/ideabrowser_data.json');
  } else {
    console.log('Searching for self.__next_f or JSON payloads in HTML...');
    const chunks = [...html.matchAll(/self\.__next_f\.push\(\[1,"([^"]+)"\]\)/g)];
    console.log('Next.js App Router chunks found:', chunks.length);
    let full = '';
    for (const c of chunks) {
      full += c[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\');
    }
    fs.writeFileSync('scripts/ideabrowser_chunks.txt', full, 'utf8');
    console.log('Saved App Router chunks to scripts/ideabrowser_chunks.txt');
  }
} catch (err) {
  console.error(err);
}
