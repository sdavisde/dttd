import { Suspense } from 'react'
import { NavbarServer } from './navbar/navbar-server'
import { NavbarSkeleton } from './navbar/navbar-skeleton'

export default function PublicNavbar() {
  return (
    <Suspense fallback={<NavbarSkeleton />}>
      <NavbarServer />
    </Suspense>
  )
}
