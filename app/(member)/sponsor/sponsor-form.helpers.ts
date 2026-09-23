import type { SponsorFormSchema } from './SponsorForm'

export const SPONSOR_FORM_TEST_DATA: Omit<SponsorFormSchema, 'weekend_id'> = {
  candidate_name: 'Test Candidate',
  candidate_email: 'test.candidate@example.com',
  sponsor_name: 'Test Sponsor',
  sponsor_address: '456 Oak Ave, Dallas, TX 75201',
  sponsor_email: '',
  sponsor_phone: '5551112222',
  sponsor_church: 'Grace Community Church',
  sponsor_weekend: 'DTTD #40, Dusty Trails',
  reunion_group: 'Faith Walkers, Dallas TX',
  attends_secuela: 'yes',
  contact_frequency: 'Weekly at church and small group',
  church_environment: 'Active member, serves in worship team and small groups.',
  home_environment: 'Stable home life with supportive family.',
  social_environment:
    'Well-connected in the community, active in local outreach.',
  work_environment: 'Professional environment, respected by colleagues.',
  god_evidence:
    'Has shown a growing desire to deepen their faith and serve others.',
  support_plan:
    'Will pray daily, attend sendoff, write agape letters, and be available for 4th day support.',
  prayer_request: 'Pray for openness to what God has planned for this weekend.',
  payment_owner: 'sponsor',
}
