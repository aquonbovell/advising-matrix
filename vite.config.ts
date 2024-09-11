import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';

export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
    exclude: ['@node-rs/argon2', '@node-rs/bcrypt'],
  },
  ssr: {
    noExternal: ['@node-rs/argon2', '@node-rs/bcrypt'],
  },
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}']
	}
});
