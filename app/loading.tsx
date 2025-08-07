import Navbar from '@/components/public-navbar'
import { Footer } from '@/components/footer'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <div className='flex justify-center items-center h-[80vh]'>
          <div className='w-16 h-16 animate-spin rounded-full border-4 border-gray-300 border-t-primary'></div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
