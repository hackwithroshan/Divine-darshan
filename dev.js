const esbuild = require('esbuild');
const path = require('path');

(async () => {
    try {
        // Use the context API to setup a build context that can be watched and served
        const ctx = await esbuild.context({
            entryPoints: [path.join(__dirname, 'index.tsx')],
            bundle: true,
            outfile: path.join(__dirname, 'index.js'),
            sourcemap: true,
            target: 'es2020',
            define: { 'process.env.NODE_ENV': '"development"' },
        });

        // Start the server, which will rebuild on file changes
        const { host, port } = await ctx.serve({
            servedir: __dirname, // Serve the root directory
            port: 3000,
        });

        console.log(`
----------------------------------------------------
Frontend dev server is live at: http://${host}:${port}
Watching for file changes...
----------------------------------------------------
        `);

    } catch (e) {
        console.error("Failed to start dev server:", e);
        process.exit(1);
    }
})();
