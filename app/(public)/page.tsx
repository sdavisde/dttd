import { Calendar, Mail, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'
import { Typography } from '@/components/ui/typography'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main Content */}
      <main className="container mx-auto p-0 md:px-6 md:py-8 max-w-4xl">
        {/* Hero Section with Background Image */}
        <div className="relative md:rounded-lg overflow-hidden mb-12 min-h-[500px] flex items-center justify-center shadow-md">
          <Image
            src="/tanglewood.jpg"
            alt="Community gathering"
            className="absolute inset-0 object-cover w-full h-full"
            width={1200}
            height={500}
            priority
          />
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>

          {/* Hero Content */}
          <div className="relative z-10 text-center px-6 py-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Welcome Friends
            </h2>
            <p className="text-xl text-white font-bold mb-8 leading-relaxed max-w-2xl mx-auto">
              Dusty Trails is our local Tres Dias community - a place where
              Christians gather for spiritual renewal, fellowship, and
              encouragement in faith.
            </p>

            {/* Scripture */}
            <Card className="bg-white/20 border-none p-6 max-w-2xl mx-auto backdrop-blur-sm">
              <CardTitle>
                <Typography className="text-background text-lg italic leading-relaxed text-center">
                  "For in Christ all the fullness of the Deity lives in bodily
                  form, and in Christ you have been brought to fullness. He is
                  the head over every power and authority."
                </Typography>
              </CardTitle>
              <CardDescription>
                <Typography className="text-background text-base font-medium text-center">
                  - Colossians 2:9-10
                </Typography>
              </CardDescription>
            </Card>
          </div>
        </div>

        {/* What We Do & Upcoming Weekends */}
        <div className="grid md:grid-cols-2 gap-8 mb-12 px-4">
          {/* About Tres Dias */}
          <div>
            <Typography variant="h2" className="text-gray-800 mb-4">
              What is Tres Dias?
            </Typography>
            <p className="text-gray-600 leading-relaxed">
              Tres Dias is an international movement designed to create an
              environment for strengthening your walk with Christ. It's a time
              of worship, fellowship, learning, and personal reflection in a
              supportive Christian community.
            </p>
          </div>

          {/* Upcoming Weekends */}
          <div className="flex flex-col gap-4">
            <Typography variant="h2" className="text-gray-800">
              Upcoming Weekends
            </Typography>

            <Alert>
              <Calendar />
              <AlertTitle className="font-bold">DTTD #10 Mens</AlertTitle>
              <AlertDescription>Weekend: September 4-7, 2025</AlertDescription>
            </Alert>

            <Alert>
              <Calendar />
              <AlertTitle className="font-bold">DTTD #10 Womens</AlertTitle>
              <AlertDescription>
                Weekend: September 11-14, 2025
              </AlertDescription>
            </Alert>
          </div>
        </div>

        {/* Contact */}
        <div className="bg-gray-50 rounded-lg pb-6 text-center">
          <h3 className="text-xl font-bold text-gray-800 mb-4">
            Reach Out To The Community
          </h3>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-secondary-foreground" />
              <span className="text-secondary-foreground">
                admin@dustytrailstresdias.org
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
