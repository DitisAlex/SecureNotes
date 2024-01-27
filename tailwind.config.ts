import { type Config } from 'tailwindcss';
import { fontFamily } from 'tailwindcss/defaultTheme';

export default {
	content: ['./src/**/*.tsx'],
	theme: {
		extend: {
			fontFamily: {
				mono: ['"Poppins"', ...fontFamily.mono]
			},
			backgroundImage: {
				background: "url('/assets/background.jpg')"
			}
		}
	},
	plugins: []
} satisfies Config;
