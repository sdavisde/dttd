import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Calendar, Heart, Users } from 'lucide-react'

import { Button, Card, CardActions, CardContent, CardHeader, Typography } from '@mui/material'

export default function Home() {
  return (
    <div className='flex flex-col min-h-screen'>
      <main className='flex-1'>
        <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-50'>
          <div className='px-4 md:px-6'>
            <div className='grid gap-6 lg:grid-cols-2 lg:gap-12 items-center'>
              <div className='space-y-4'>
                <h1 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>
                  Strengthen Your Walk with Christ
                </h1>
                <p className='max-w-[600px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                  Dusty Trails Tres Dias is a Christian community dedicated to helping people pursue a stronger
                  relationship with God through spiritual renewal weekends and ongoing fellowship.
                </p>
                <div className='flex flex-col gap-2 min-[400px]:flex-row'>
                  <Link href='/events'>
                    <Button className='flex gap-1'>
                      Upcoming Events
                      <ArrowRight className='h-4 w-4' />
                    </Button>
                  </Link>
                  <Link href='/about'>
                    <Button variant='outlined'>Learn More</Button>
                  </Link>
                </div>
              </div>
              <div className='flex justify-center'>
                <div className='relative w-full max-w-[500px] aspect-video rounded-xl overflow-hidden bg-gray-200'>
                  <Image
                    src='/2025-weekend-schedule.png'
                    alt='Community gathering'
                    className='object-cover w-full h-full'
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='px-4 md:px-6'>
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <div className='space-y-2'>
                <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Our Community Portal</h2>
                <p className='max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                  Connect with our community, register for events, and sponsor new candidates through our online portal.
                </p>
              </div>
            </div>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mt-12'>
              <Card>
                <CardHeader>
                  <Calendar className='w-10 h-10 text-gray-800 mb-2' />
                  <Typography variant='h6'>Register for Events</Typography>
                  <Typography variant='body1'>
                    Sign up and pay for upcoming Tres Dias weekends and community gatherings.
                  </Typography>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-gray-500'>
                    Our events are designed to deepen your faith and connect you with fellow believers in Christ.
                  </p>
                </CardContent>
                <CardActions>
                  <Link
                    href='/events'
                    className='w-full'
                  >
                    <Button className='w-full'>View Events</Button>
                  </Link>
                </CardActions>
              </Card>
              <Card>
                <CardHeader>
                  <Heart className='w-10 h-10 text-gray-800 mb-2' />
                  <Typography variant='h6'>Sponsor a Candidate</Typography>
                  <Typography variant='body1'>
                    Help others experience the blessing of Tres Dias by sponsoring new candidates.
                  </Typography>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-gray-500'>
                    Sponsorship is a meaningful way to share the gift of Tres Dias with friends and family.
                  </p>
                </CardContent>
                <CardActions>
                  <Link
                    href='/sponsor'
                    className='w-full'
                  >
                    <Button className='w-full'>Sponsor Now</Button>
                  </Link>
                </CardActions>
              </Card>
              <Card>
                <CardHeader>
                  <Users className='w-10 h-10 text-gray-800 mb-2' />
                  <Typography variant='h6'>Prepare for Weekends</Typography>
                  <Typography variant='body1'>
                    Access resources and information to prepare for your Tres Dias experience.
                  </Typography>
                </CardHeader>
                <CardContent>
                  <p className='text-sm text-gray-500'>
                    Find packing lists, schedules, and spiritual preparation materials for your upcoming weekend.
                  </p>
                </CardContent>
                <CardActions>
                  <Link
                    href='/resources'
                    className='w-full'
                  >
                    <Button className='w-full'>View Resources</Button>
                  </Link>
                </CardActions>
              </Card>
            </div>
          </div>
        </section>
        <section className='w-full py-12 md:py-24 lg:py-32 bg-gray-50'>
          <div className='px-4 md:px-6'>
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <div className='space-y-2'>
                <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Upcoming Events</h2>
                <p className='max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                  Join us for our next Tres Dias weekend or community gathering.
                </p>
              </div>
            </div>
            <div className='grid gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3'>
              {[
                {
                  title: "Men's Weekend #42",
                  date: 'June 15-18, 2023',
                  description: 'A spiritual renewal weekend for men to deepen their relationship with Christ.',
                },
                {
                  title: "Women's Weekend #42",
                  date: 'July 20-23, 2023',
                  description: 'A spiritual renewal weekend for women to deepen their relationship with Christ.',
                },
                {
                  title: 'Community Reunion',
                  date: 'August 5, 2023',
                  description: 'A time of fellowship, worship, and celebration for all Tres Dias members.',
                },
              ].map((event, index) => (
                <Card key={index}>
                  <CardHeader>
                    <Typography variant='h6'>{event.title}</Typography>
                    <Typography variant='body1'>{event.date}</Typography>
                  </CardHeader>
                  <CardContent>
                    <p className='text-sm text-gray-500'>{event.description}</p>
                  </CardContent>
                  <CardActions>
                    <Link
                      href={`/events/${index + 1}`}
                      className='w-full'
                    >
                      <Button
                        variant='outlined'
                        className='w-full'
                      >
                        Learn More
                      </Button>
                    </Link>
                  </CardActions>
                </Card>
              ))}
            </div>
            <div className='flex justify-center mt-8'>
              <Link href='/events'>
                <Button variant='outlined'>View All Events</Button>
              </Link>
            </div>
          </div>
        </section>
        <section className='w-full py-12 md:py-24 lg:py-32'>
          <div className='px-4 md:px-6'>
            <div className='flex flex-col items-center justify-center space-y-4 text-center'>
              <div className='space-y-2'>
                <h2 className='text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl'>Testimonials</h2>
                <p className='max-w-[900px] text-gray-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed'>
                  Hear from members of our community about how Tres Dias has impacted their lives.
                </p>
              </div>
            </div>
            <div className='grid gap-6 mt-12 md:grid-cols-2 lg:grid-cols-3'>
              {[
                {
                  name: 'John D.',
                  quote:
                    "Tres Dias changed my life. I experienced God's love in a way I never had before, and I've grown so much in my faith since then.",
                },
                {
                  name: 'Sarah M.',
                  quote:
                    "The community I found through Tres Dias has been such a blessing. I've made lifelong friends who encourage me in my walk with Christ.",
                },
                {
                  name: 'Michael R.',
                  quote:
                    "Sponsoring candidates has been one of the most rewarding experiences of my life. Seeing others encounter God's grace is incredible.",
                },
              ].map((testimonial, index) => (
                <Card
                  key={index}
                  className='text-center'
                >
                  <CardHeader>
                    <Typography variant='h6'>{testimonial.name}</Typography>
                  </CardHeader>
                  <CardContent>
                    <p className='italic text-gray-500'>"{testimonial.quote}"</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className='border-t bg-gray-50'>
        <div className='flex flex-col gap-4 py-10 md:flex-row md:gap-8 md:py-12 px-4 md:px-6'>
          <div className='flex-1 space-y-4'>
            <div className='font-semibold text-xl'>Dusty Trails Tres Dias</div>
            <p className='text-sm text-gray-500'>
              A Christian community dedicated to helping people pursue a stronger relationship with God.
            </p>
          </div>
          <div className='flex flex-col gap-2 md:gap-4'>
            <div className='font-medium'>Links</div>
            <nav className='flex flex-col gap-2 text-sm'>
              <Link
                href='/events'
                className='hover:underline'
              >
                Events
              </Link>
              <Link
                href='/sponsor'
                className='hover:underline'
              >
                Sponsor
              </Link>
              <Link
                href='/resources'
                className='hover:underline'
              >
                Resources
              </Link>
              <Link
                href='/about'
                className='hover:underline'
              >
                About
              </Link>
            </nav>
          </div>
          <div className='flex flex-col gap-2 md:gap-4'>
            <div className='font-medium'>Contact</div>
            <div className='text-sm'>
              <p>info@dustytrailstresdias.org</p>
              <p>(555) 123-4567</p>
            </div>
          </div>
        </div>
        <div className='border-t py-6 text-center text-sm text-gray-500'>
          <p>© {new Date().getFullYear()} Dusty Trails Tres Dias. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
