import Navbar from '@/components/public-navbar'
import { Footer } from '@/components/footer'
import { CircularProgress } from '@mui/material'

export default function Loading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <div className='flex justify-center items-center h-[80vh]'>
          <CircularProgress size={75} />
        </div>
      </main>
      <Footer />
    </div>
  )
}
