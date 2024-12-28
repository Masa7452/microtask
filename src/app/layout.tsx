import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Microtask',
  description: 'A simple and effective todo app for managing your tasks',
  icons: {
    icon: '/microtask-logo.png',
    apple: '/microtask-logo.png',
  },
  openGraph: {
    title: 'Microtask',
    description: 'A simple and effective todo app for managing your tasks',
    images: [{
      url: '/microtask-logo.png',
      width: 800,
      height: 600,
    }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  )
}