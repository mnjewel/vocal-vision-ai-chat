
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			fontFamily: {
				sans: ['SF Pro Display', 'Inter', 'sans-serif'],
				mono: ['SF Mono', 'Menlo', 'monospace'],
			},
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				w3j: {
					primary: '#3B82F6', // Blue
					secondary: '#8B5CF6', // Purple
					accent: '#06B6D4', // Teal
					light: '#F9FAFB',
					dark: '#111827',
					gray: '#6B7280',
				},
				neural: {
					blue: {
						light: '#38BDF8',
						DEFAULT: '#3B82F6',
						dark: '#2563EB'
					},
					purple: {
						light: '#A78BFA',
						DEFAULT: '#8B5CF6',
						dark: '#7C3AED'
					},
					teal: {
						light: '#2DD4BF',
						DEFAULT: '#14B8A6',
						dark: '#0D9488'
					},
					gray: {
						light: '#F9FAFB',
						DEFAULT: '#6B7280',
						dark: '#1F2937'
					},
					glass: {
						light: 'rgba(255, 255, 255, 0.7)',
						dark: 'rgba(17, 24, 39, 0.7)',
					}
				},
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'typing': {
					'0%': { width: '0%', opacity: '0' },
					'10%': { opacity: '1' },
					'90%': { opacity: '1' },
					'100%': { width: '100%', opacity: '1' }
				},
				'pulse-gentle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.5' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(10px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'message-appear': {
					'0%': { opacity: '0', transform: 'translateY(20px) scale(0.98)' },
					'100%': { opacity: '1', transform: 'translateY(0) scale(1)' }
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-5px)' }
				},
				'neural-glow': {
					'0%, 100%': { opacity: '0.5' },
					'50%': { opacity: '1' }
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'neural-typing': {
					'0%': { transform: 'translateX(-100%)' },
					'50%': { transform: 'translateX(100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'scale-in': {
					'0%': { transform: 'scale(0.95)', opacity: '0' },
					'100%': { transform: 'scale(1)', opacity: '1' }
				},
				'scale-out': {
					'0%': { transform: 'scale(1)', opacity: '1' },
					'100%': { transform: 'scale(0.95)', opacity: '0' }
				},
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'typing': 'typing 1.5s ease-out',
				'pulse-gentle': 'pulse-gentle 1.5s infinite',
				'fade-in': 'fade-in 0.3s ease-out',
				'message-appear': 'message-appear 0.5s cubic-bezier(0.22, 1, 0.36, 1)',
				'float': 'float 3s ease-in-out infinite',
				'neural-glow': 'neural-glow 2s ease-in-out infinite',
				'shimmer': 'shimmer 2.5s infinite linear',
				'neural-typing': 'neural-typing 2s infinite ease-in-out',
				'scale-in': 'scale-in 0.2s ease-out',
				'scale-out': 'scale-out 0.2s ease-out',
			},
			backgroundImage: {
				'neural-gradient-blue': 'var(--neural-gradient-blue)',
				'neural-gradient-purple': 'var(--neural-gradient-purple)',
				'neural-gradient-teal': 'var(--neural-gradient-teal)',
				'neural-gradient-neutral': 'var(--neural-gradient-neutral)',
			},
			backdropBlur: {
				xs: '2px',
			},
			boxShadow: {
				'neural': '0 8px 32px rgba(0, 0, 0, 0.08)',
				'neural-strong': '0 8px 32px rgba(0, 0, 0, 0.12)',
				'neural-inner': 'inset 0 2px 4px rgba(0, 0, 0, 0.06)',
				'neural-button': '0 2px 8px rgba(59, 130, 246, 0.3)',
			},
			transitionProperty: {
				'height': 'height',
				'spacing': 'margin, padding',
				'width': 'width',
				'size': 'width, height',
			},
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
