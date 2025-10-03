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
    target: ['es2020'],
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

  // Copy public directory if it exists, otherwise create an empty one in dist.
  const publicDir = 'public';
  const destPublicDir = path.join(distDir, 'public');
  if (fs.existsSync(publicDir)) {
      // copySync copies the contents of publicDir into the destination
      fs.copySync(publicDir, destPublicDir);
  } else {
      // If the source 'public' directory doesn't exist, create an empty one in the 'dist'
      // directory. This prevents the build from failing and avoids 404 errors for assets,
      // although the assets themselves will be missing until added to the source.
      fs.ensureDirSync(destPublicDir);
      console.log("Warning: 'public' directory not found. An empty 'public' directory was created in 'dist'.");
  }

  console.log('Frontend build successful. Output in /dist directory.');
}

build().catch((e) => {
    console.error('Build failed:', e);
    process.exit(1);
});