import autoprefixer from 'autoprefixer';
import tailwind from 'tailwindcss';

/** @type {import('postcss-load-config').Config} */
const config = {
	plugins: [
		tailwind,
		autoprefixer,
		...(process.env.NODE_ENV === 'production' ? { cssnano: {} } : {})
	]
};

export default config;
