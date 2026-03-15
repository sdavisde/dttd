import { Calendar, Mail, MapPin, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardTitle,
} from '@/components/ui/card'
import Image from 'next/image'
import { Typography } from '@/components/ui/typography'
import { getActiveWeekends } from '@/services/weekend'
import { isOk } from '@/lib/results'
import { WeekendType } from '@/lib/weekend/types'
import { isNil } from 'lodash'
import { format } from 'date-fns'

export default async function Home() {
  const weekendsResult = await getActiveWeekends()

  const mensWeekend = isOk(weekendsResult)
    ? weekendsResult.data[WeekendType.MENS]
    : null
  const womensWeekend = isOk(weekendsResult)
    ? weekendsResult.data[WeekendType.WOMENS]
    : null

  const weekendNumber = mensWeekend?.number ?? womensWeekend?.number ?? null

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${format(start, 'MMMM d')} – ${format(end, 'd, yyyy')}`
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <div className="relative overflow-hidden min-h-[560px] flex items-center justify-center">
          <Image
            src="/tanglewood.jpg"
            alt="Community gathering at Tanglewood"
            className="absolute inset-0 object-cover w-full h-full"
            width={1920}
            height={800}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

          <div className="relative z-10 text-center px-6 py-16 max-w-3xl mx-auto">
            <Typography
              variant="h1"
              className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight"
            >
              Welcome Friends
            </Typography>
            <p className="text-lg md:text-xl text-white/90 mb-10 leading-relaxed max-w-2xl mx-auto">
              Dusty Trails is our local Tres Dias community — a place where
              Christians gather for spiritual renewal, fellowship, and
              encouragement in faith.
            </p>

            <Card className="bg-white/15 border-white/20 p-6 max-w-xl mx-auto backdrop-blur-md">
              <CardTitle>
                <Typography className="text-white text-base md:text-lg italic leading-relaxed text-center">
                  &ldquo;For in Christ all the fullness of the Deity lives in
                  bodily form, and in Christ you have been brought to
                  fullness.&rdquo;
                </Typography>
              </CardTitle>
              <CardDescription>
                <Typography className="text-white/80 text-sm font-medium text-center mt-2">
                  Colossians 2:9-10
                </Typography>
              </CardDescription>
            </Card>
          </div>
        </div>

        {/* Content Section */}
        <div className="container mx-auto max-w-5xl px-4 md:px-6 py-12 md:py-16">
          <div className="grid md:grid-cols-2 gap-10 md:gap-16">
            {/* About */}
            <div className="space-y-4">
              <Typography variant="h2" className="text-2xl font-bold">
                What is Tres Dias?
              </Typography>
              <p className="text-muted-foreground leading-relaxed">
                Tres Dias is an international movement designed to create an
                environment for strengthening your walk with Christ. It&apos;s a
                time of worship, fellowship, learning, and personal reflection
                in a supportive Christian community.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our weekends bring together candidates and team members for a
                72-hour experience of growth, encouragement, and deeper faith.
              </p>
            </div>

            {/* Upcoming Weekends */}
            <div className="space-y-4">
              <Typography variant="h2" className="text-2xl font-bold">
                Upcoming Weekends
              </Typography>

              {!isNil(weekendNumber) ? (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                    DTTD #{weekendNumber}
                  </div>

                  {!isNil(mensWeekend) && (
                    <Card className="p-4">
                      <CardContent className="p-0 flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Men&apos;s Weekend</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateRange(
                              mensWeekend.start_date,
                              mensWeekend.end_date
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {!isNil(womensWeekend) && (
                    <Card className="p-4">
                      <CardContent className="p-0 flex items-start gap-3">
                        <div className="rounded-lg bg-primary/10 p-2 mt-0.5">
                          <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">Women&apos;s Weekend</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDateRange(
                              womensWeekend.start_date,
                              womensWeekend.end_date
                            )}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button
                    variant="outline"
                    className="w-full mt-2"
                    href="/sponsor"
                  >
                    Sponsor a Candidate
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Card className="p-6">
                  <CardContent className="p-0 text-center">
                    <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">
                      No upcoming weekends scheduled yet. Check back soon!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t bg-muted/40">
          <div className="container mx-auto max-w-5xl px-4 md:px-6 py-10">
            <div className="text-center space-y-3">
              <Typography variant="h3" className="text-xl font-bold">
                Reach Out To The Community
              </Typography>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Have questions about Tres Dias or want to learn more? We&apos;d
                love to hear from you.
              </p>
              <div className="flex justify-center items-center gap-2 pt-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <a
                  href="mailto:admin@dustytrailstresdias.org"
                  className="text-primary hover:underline"
                >
                  admin@dustytrailstresdias.org
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
