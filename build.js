const esbuild = require('esbuild');
const fs = require('fs-extra');
const path = require('path');

async function build() {
  const distDir = 'dist';
  const publicDir = 'public';

  try {
    // 1. Clean the destination directory
    fs.emptyDirSync(distDir);
    console.log(`Cleaned '${distDir}' directory.`);

    // 2. Build the main JavaScript bundle
    await esbuild.build({
      entryPoints: ['index.tsx'],
      bundle: true,
      outfile: path.join(distDir, 'bundle.js'),
      minify: true,
      sourcemap: true,
      target: ['es2020'],
      define: { 'process.env.NODE_ENV': '"production"' }
    });
    console.log('esbuild bundling successful.');

    // 3. Copy and modify index.html for production
    const sourceHtmlPath = 'index.html';
    const destHtmlPath = path.join(distDir, 'index.html');
    
    let html = fs.readFileSync(sourceHtmlPath, 'utf8');

    // Remove importmap (dev only)
    html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, '');
    
    // Replace dev script with production bundle
    html = html.replace(
      '<script type="module" src="/index.js"></script>', 
      '<script defer src="/bundle.js"></script>'
    );
    
    fs.writeFileSync(destHtmlPath, html);
    console.log(`'${sourceHtmlPath}' processed and copied to '${distDir}'.`);

    // 4. Robustly handle the 'public' directory
    const destPublicDir = path.join(distDir, publicDir);

    // This is the key fix: Ensure the source 'public' directory exists before attempting to copy.
    // If it doesn't exist, this will create an empty 'public' directory in the project root.
    // This prevents the 'lstat' error during the copy operation.
    fs.ensureDirSync(publicDir);
    console.log(`Ensured source '${publicDir}' directory exists.`);

    // Now, safely copy the 'public' directory (which might be empty) to 'dist'.
    fs.copySync(publicDir, destPublicDir);
    console.log(`Copied '${publicDir}' directory to '${distDir}'.`);
    
    console.log('\n✅ Frontend build successful! Output is in the /dist directory.');

  } catch (e) {
    console.error('\n❌ Build failed:', e);
    process.exit(1);
  }
}

build();
