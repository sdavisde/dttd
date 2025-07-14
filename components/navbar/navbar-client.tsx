'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type NavElement = {
  name: string
  slug: string
  permissions_needed: string[]
  children?: NavElement[]
}

type NavbarClientProps = {
  navElements: NavElement[]
}

export function Navbar({ navElements }: NavbarClientProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className='bg-primary text-white px-4 py-3'>
      <div className='flex items-center justify-between'>
        {/* Mobile Menu Button */}
        <div className='md:hidden'>
          <Sheet
            open={isOpen}
            onOpenChange={setIsOpen}
          >
            <SheetTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
              >
                <Menu className='h-6 w-6' />
                <span className='sr-only'>Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side='left'
              className='bg-amber-900 text-white border-amber-800'
            >
              <div className='flex flex-col space-y-4 mt-8'>
                {navElements.map((item) => (
                  <Link
                    key={item.name}
                    href={`/${item.slug}`}
                    className='text-lg font-medium hover:text-amber-200 transition-colors'
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Logo/Title */}
        <div className='flex-1 md:flex-none flex items-center justify-center'>
          <Link
            href='/'
            className='font-bold text-xl md:text-2xl'
          >
            <span className='hidden md:inline'>Dusty Trails Tres Dias</span>
            <span className='md:hidden'>DTTD</span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center space-x-8 flex-1 justify-end me-8'>
          {navElements.map((item) => (
            <Link
              key={item.name}
              href={`/${item.slug}`}
              className='text-white hover:text-amber-200 transition-colors font-medium'
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Avatar */}

        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className='flex-shrink-0'>
              <Avatar className='h-10 w-10 bg-white'>
                <AvatarFallback className='bg-white text-amber-900 font-bold text-lg'>S</AvatarFallback>
              </Avatar>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href='/profile'>Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem className='text-destructive hover:text-destructive'>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  )
}
