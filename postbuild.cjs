const fs = require('fs');
const path = require('path');

const distPath = path.join(__dirname, 'dist', 'index.html');
let html = fs.readFileSync(distPath, 'utf8');

const scriptTagMatch = html.match(/<script\s+[^>]*src="\/[^"]*main\.js"[^>]*><\/script>/i);
if (!scriptTagMatch) {
  process.exit(1);
}

const scriptTag = scriptTagMatch[0].replace(/src="\/[^"]*main\.js"/, 'src="main.js"');

const cssLinkMatch = html.match(/<link\s+[^>]*href="\/[^"]*main\.css"[^>]*>/i);
if (cssLinkMatch) {
  const cssLink = cssLinkMatch[0].replace(/href="\/[^"]*main\.css"/, 'href="main.css"');
  html = html.replace(cssLinkMatch[0], cssLink);
}

html = html.replace(scriptTagMatch[0], '').replace('</body>', scriptTag + '\n</body>');

fs.writeFileSync(distPath, html);