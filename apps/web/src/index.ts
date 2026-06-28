const port = parseInt(process.env.PORT || "3000");

Bun.serve({
  port,
  async fetch(req) {
    const pathname = new URL(req.url).pathname;

    if (pathname === "/") {
      return new Response(Bun.file("./index.html"));
    }

    // Transpile .tsx/.ts with Bun.build (resolves bare imports)
    if (/\.tsx?$/.test(pathname)) {
      try {
        const result = await Bun.build({
          entrypoints: [`.${pathname}`],
          target: "browser",
          format: "esm",
          define: {
            "process.env.BACKEND_URL": JSON.stringify(Bun.env.BACKEND_URL || ""),
          },
        });
        if (result.success && result.outputs.length > 0) {
          return new Response(result.outputs[0]);
        }
        return new Response(result.logs.join("\n"), { status: 500 });
      } catch (e: any) {
        return new Response(e?.message || String(e), { status: 500 });
      }
    }

    // Process CSS with Tailwind
    if (pathname.endsWith(".css")) {
      const { default: tailwind } = await import("bun-plugin-tailwind");
      try {
        const result = await Bun.build({
          entrypoints: [`.${pathname}`],
          target: "browser",
          plugins: [tailwind],
        });
        if (result.success && result.outputs.length > 0) {
          return new Response(result.outputs[0]);
        }
      } catch {}
      const f = Bun.file(`.${pathname}`);
      if (await f.exists()) return new Response(f);
    }

    // Static files
    const file = Bun.file(`.${pathname}`);
    if (await file.exists()) return new Response(file);

    // SPA fallback
    return new Response(Bun.file("./index.html"));
  },
});
