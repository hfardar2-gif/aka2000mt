// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import type { Plugin } from "vite";

const dashboardChartValueFixes: Plugin = {
  name: "aka-dashboard-chart-value-fixes",
  enforce: "pre",
  transform(code, id) {
    const normalizedId = id.split("?", 1)[0].replace(/\\/g, "/");
    if (!normalizedId.endsWith("/src/routes/index.tsx")) return null;

    let transformed = code;

    // Daily production values are independent process values, not a 100%-stacked total.
    transformed = transformed.replaceAll(' stackId="a"', "");

    // Always show the exact numeric value on chart axes and tooltips. No compact or percent scaling.
    transformed = transformed.replaceAll(
      '<YAxis stroke="var(--color-muted-foreground)" fontSize={11} />',
      '<YAxis stroke="var(--color-muted-foreground)" fontSize={11} tickFormatter={(value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 3 })} />',
    );
    transformed = transformed.replaceAll(
      '<Tooltip contentStyle={tooltipStyle} />',
      '<Tooltip contentStyle={tooltipStyle} formatter={(value) => Number(value).toLocaleString("en-US", { maximumFractionDigits: 3 })} />',
    );

    return transformed === code ? null : { code: transformed, map: null };
  },
};

export default defineConfig({
  vite: {
    plugins: [dashboardChartValueFixes],
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
