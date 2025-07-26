import { CircularProgress } from '@mui/material'

export default function Loading() {
  return (
    <div
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}
    >
      <div className="flex justify-center items-center h-[80vh]">
        <CircularProgress size={75} />
      </div>
    </div>
  )
}
