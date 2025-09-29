const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

async function build() {
  const distDir = 'dist';

  // Clean the dist directory
  fs.emptyDirSync(distDir);

  // Build the main TSX file
  await esbuild.build({
    entryPoints: ['index.tsx'],
    bundle: true,
    outfile: path.join(distDir, 'bundle.js'),
    minify: true,
    sourcemap: true,
    target: ['chrome58', 'firefox57', 'safari11', 'edge16'],
    define: { 'process.env.NODE_ENV': '"production"' }
  });

  // Copy and modify index.html
  const sourceHtmlPath = 'index.html';
  const destHtmlPath = path.join(distDir, 'index.html');
  
  let html = fs.readFileSync(sourceHtmlPath, 'utf8');

  // Remove importmap as it's for development only
  html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
  
  // Replace the development script tag with the production bundle
  html = html.replace(
    '<script type="module" src="/index.js"></script>', 
    '<script defer src="/bundle.js"></script>'
  );
  
  fs.writeFileSync(destHtmlPath, html);

  // Copy other static assets if any
  // fs.copySync('public', distDir);

  console.log('Frontend build successful. Output in /dist directory.');
}

build().catch((e) => {
    console.error('Build failed:', e);
    process.exit(1);
});