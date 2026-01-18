# Webhook / Payments Outage

We just had an incident where the webhook requests received from Stripe were not creating weekend_roster_pamyent records as they should.
I want you to implement playwright testing that we can use locally (at first, with yarn e2e:test) that tests the team payment flow (and candidate payment flow) and confirms that the webhooks are received correctly and the flow of saving to the database is working and all that.

## Follow up actions

### Allow testing webhooks more easily

note: i think this might be better deployed as a docker container or something... what ways do we have to deploy multiple services?
I think tilt is overkill for this, especially since i'm not deploying k8s

Steps to setup webhooks locally (should be alias'd to `yarn start:webhooks`)

1. "stripe login" - need to open with the dttd stripe account
2. stripe listen --forward-to localhost:3000/api/webhooks/complete-checkout

### E2E automated testing script

Need to at least test the key flows at first:

- Can a team member pay, and when they do, do we receive a payment record / proof artifacts from webhook flow
- Can a candidate or sponsor pay, and when they do, do we receive a payment record / proof artifacts from webhook flow
- Can a user create an account
- Can an existing user sign in
- Ensure non-admin users cannot access the admin, and ensure admin users can.

## Use new payment service instead of existing payment actions
