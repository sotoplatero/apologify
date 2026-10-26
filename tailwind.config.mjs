/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Jost', 'system-ui', 'sans-serif'],
				serif: ['Spectral', 'Georgia', 'serif'],
				cursive: ['Dancing Script', 'cursive'],
				display: ['Spectral', 'Georgia', 'serif'],
				poster: ['Anton', 'Impact', 'sans-serif'],
			},
		},
	},
	plugins: [
		require('@tailwindcss/typography'),
		require('daisyui'),
	],
	daisyui: {
		// Themes must be listed here for data-theme to work. "apology" is the
		// brand theme (the layout sets <html data-theme="apology">): postmark
		// red on warm paper — warm, sincere, editorial. See LayoutBase.astro.
		themes: [
			{
				apology: {
					'color-scheme': 'light',
					primary: '#C1272D',           // postmark red — brand primary (matches the logo heart)
					'primary-content': '#FAF7F1', // paper
					secondary: '#5E7355',         // sage (used for gentle support / "accepted")
					'secondary-content': '#F5F1E8',
					accent: '#2C4A6E',            // fountain-pen ink blue — decorative accent
					'accent-content': '#F5F1E8',
					neutral: '#2B2621',           // warm dark
					'neutral-content': '#F5F1E8',
					'base-100': '#FAF7F1',        // warm paper (shared with Apology News)
					'base-200': '#F2EDE3',        // quiet bands
					'base-300': '#E0D8C8',        // borders / hairlines
					'base-content': '#241F1A',    // warm near-black ink
					info: '#2C4A6E',
					success: '#5E7355',
					warning: '#C08A2D',
					error: '#A63A2E',
					'--rounded-box': '0.25rem',
					'--rounded-btn': '0',
					'--rounded-badge': '0',
					'--border-btn': '1px',
				},
			},
			'light',
			'dark',
		],
	},
}
