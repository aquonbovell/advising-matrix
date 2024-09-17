import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';
import cssnano from 'cssnano';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		tailwind,
		autoprefixer,
		...(process.env.NODE_ENV === 'production'
			? [
					cssnano({
						preset: ['default', { discardComments: { removeAll: true } }]
					})
				]
			: [])
	]
};

export default config;
