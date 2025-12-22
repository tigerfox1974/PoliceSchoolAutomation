import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'KKTC Polis Okulu Yönetim Sistemi',
  description: 'Eğitim ve Operasyon Yönetim Sistemi',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="tr">
      <body>{children}</body>
    </html>
  )
}
