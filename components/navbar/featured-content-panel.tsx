'use client'

import Link from 'next/link'
import { Calendar } from 'lucide-react'
import { NavFeaturedContent } from './navbar-server'

type FeaturedContentPanelProps = {
  featured: NavFeaturedContent
}

export function FeaturedContentPanel({ featured }: FeaturedContentPanelProps) {
  return (
    <div className="w-52 p-4 bg-gradient-to-br from-primary/5 to-amber-50">
      <div className="text-xs font-semibold text-primary uppercase tracking-wider mb-3">
        Coming Up
      </div>
      <div className="rounded-lg bg-white p-4 shadow-sm border border-gray-100">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          <span className="font-semibold text-gray-900 text-sm">
            {featured.title}
          </span>
        </div>
        <p className="text-xs text-gray-600 mb-3">{featured.description}</p>
        <Link
          href={featured.linkHref}
          className="text-xs font-medium text-primary hover:underline"
        >
          {featured.linkText} &rarr;
        </Link>
      </div>
    </div>
  )
}
