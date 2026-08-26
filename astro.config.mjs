// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  site: "https://dstepanov.github.io/pyronaut-web",
  // Ignition was promoted to the site root; keep its old URL working.
  redirects: {
    "/designs/ignition": "/",
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
