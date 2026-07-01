/** @type {import('tailwindcss').Config} */
export default {
	darkMode: 'class',
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				sans: ['Inter', 'sans-serif'],
				serif: ['Lora', 'Georgia', 'serif'],
				cursive: ['Dancing Script', 'cursive'],
				display: ['Fraunces', 'Georgia', 'serif'],
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
		// brand theme (the layout sets <html data-theme="apology">): fountain-pen
		// ink on warm paper — warm, sincere, editorial. See LayoutBase.astro.
		themes: [
			{
				apology: {
					'color-scheme': 'light',
					primary: '#2C4A6E',           // fountain-pen ink blue
					'primary-content': '#F5F1E8', // paper
					secondary: '#5E7355',         // sage (used for gentle support / "accepted")
					'secondary-content': '#F5F1E8',
					accent: '#B23A2E',            // postmark red — rare, decorative marks only
					'accent-content': '#F5F1E8',
					neutral: '#2B2621',           // warm dark
					'neutral-content': '#F5F1E8',
					'base-100': '#F5F1E8',        // warm paper
					'base-200': '#EDE7DB',        // sections / cards
					'base-300': '#E0D8C8',        // borders / hairlines
					'base-content': '#241F1A',    // warm near-black ink
					info: '#2C4A6E',
					success: '#5E7355',
					warning: '#C08A2D',
					error: '#A63A2E',
					'--rounded-box': '0.75rem',
					'--rounded-btn': '0.375rem',
					'--rounded-badge': '0.375rem',
					'--border-btn': '1px',
				},
			},
			'light',
			'dark',
		],
	},
}
