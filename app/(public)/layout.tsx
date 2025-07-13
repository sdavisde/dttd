import type { Metadata } from 'next'
import Navbar from '@/components/public-navbar'
import { Footer } from '@/components/footer'

export const metadata: Metadata = {
  title: 'Dusty Trails Tres Dias',
  description: 'Being like-minded, having the same love, being one in spirit and of one mind. Phil 2:2',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>{children}</main>
      <Footer />
    </div>
  )
}
