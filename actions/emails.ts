'use server'

import { Resend } from 'resend'
import SponsorshipNotificationEmail from '@/components/email/SponsorshipNotificationEmail'
import { createClient } from '@/lib/supabase/server'

const resend = new Resend(process.env.RESEND_API_KEY)

// Send sponsorship notification email to preweekend couple
export async function sendSponsorshipNotificationEmail(sponsorshipRequestId: string) {
  try {
    const supabase = await createClient()
    const { data: sponsorshipRequest, error: sponsorshipRequestError } = await supabase
      .from('sponsorship_request')
      .select('*')
      .eq('id', Number(sponsorshipRequestId))
      .single()
    if (sponsorshipRequestError) {
      console.error('Error fetching sponsorship request:', sponsorshipRequestError)
      return { success: false, error: sponsorshipRequestError }
    }

    const { data: preweekendCouple, error: preweekendCoupleError } = await supabase
      .from('contact_information')
      .select('*')
      .eq('id', 'preweekend-couple')
      .single()
    if (preweekendCoupleError || !preweekendCouple?.email_address) {
      console.error('Error fetching preweekend couple:', preweekendCoupleError)
      return { success: false, error: preweekendCoupleError }
    }

    const { data, error } = await resend.emails.send({
      from: 'Dusty Trails Tres Dias <noreply@dustytrailstresdias.org>',
      to: preweekendCouple.email_address,
      subject: `New Sponsored Candidate: ${sponsorshipRequest.candidate_name} from ${sponsorshipRequest.sponsor_name}`,
      react: SponsorshipNotificationEmail(sponsorshipRequest),
    })

    if (error) {
      console.error('Email sending error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email sending exception:', error)
    return { success: false, error }
  }
}
