import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';

// tslint:disable-next-line
export default defineConfig(({ mode }) => {
	// By default this plugin will only load variables that start with VITE_*
	// To fix this we can use the loadEnv function from Vite
	// We set the third parameter to '' to load all env regardless of the `VITE_` prefix.

	// process.env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [tsconfigPaths()],
		globals: true,
		environment: 'happy-dom',
		test: {
			alias: {
				'@/': new URL('./', import.meta.url).pathname
			},
			coverage: {
				reporter: ['text'],
				all: false,
				include: ['src/server/api/routers/**/*.ts']
			}
		}
	};
});
