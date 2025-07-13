import { CircularProgress } from '@mui/material'

export default function Loading() {
  return (
    <div className='flex justify-center items-center h-[80vh]'>
      <CircularProgress size={75} />
    </div>
  )
}
