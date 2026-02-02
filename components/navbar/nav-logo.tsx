'use client'

import Link from 'next/link'

export function NavLogo() {
  return (
    <div className="absolute left-1/2 -translate-x-1/2">
      <Link href="/" className="flex flex-col items-center">
        <span className="text-xl md:text-2xl font-bold text-gray-900 tracking-tight">
          DTTD
        </span>
        <span className="hidden md:block text-[10px] text-primary uppercase tracking-widest font-medium">
          Dusty Trails Tres Dias
        </span>
      </Link>
    </div>
  )
}
