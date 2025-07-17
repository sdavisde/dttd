'use client'

import { Typography } from '@/components/ui/typography'
import { Heart } from 'lucide-react'
import Link from 'next/link'

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border">
      <div className="container mx-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 gap-4 md:gap-8 md:grid-cols-3">
            {/* Mission Statement */}
            <div>
              <Typography variant="h4" as="h6">
                Our Mission
              </Typography>
              <Typography
                variant="p"
                className="text-muted-foreground leading-relaxed"
              >
                Being like-minded, having the same love, being one in spirit and
                of one mind.
                <br />
                <Typography
                  variant="p"
                  className="text-muted-foreground italic"
                  as="span"
                >
                  Philippians 2:2
                </Typography>
              </Typography>
            </div>

            {/* Quick Links */}
            <div>
              <Typography variant="h4" as="h6">
                Quick Links
              </Typography>
              <div className="flex flex-col gap-1 mt-2">
                <Link
                  href="/sponsor"
                  className="text-muted-foreground hover:underline"
                >
                  Sponsor a Candidate
                </Link>
                <Link
                  href="/files"
                  className="text-muted-foreground hover:underline"
                >
                  Community Resources
                </Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Footer Bottom */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-2 mt-2">
            <Typography
              variant="p"
              className="text-muted-foreground flex items-center gap-1 text-center"
            >
              © {currentYear} Dusty Trails Tres Dias.
              <br /> All rights reserved.
            </Typography>
            <Typography
              variant="p"
              className="text-muted-foreground flex items-center gap-1"
            >
              Made with <Heart size={14} color="#ef4444" /> for our community
            </Typography>
          </div>
        </div>
      </div>
    </footer>
  )
}
