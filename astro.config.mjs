// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  build: {
    assets: 'static'
  },

  base: import.meta.env.DEV ? undefined : '/project-1020/',

  site: import.meta.env.DEV
    ? 'http://localhost:4321/'
    : 'https://20essentials.github.io/project-1020/',

  integrations: [react()]
});