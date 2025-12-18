export enum Errors {
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  NOT_LOGGED_IN = 'NOT_LOGGED_IN',
  MISSING_CANDIDATE_ID = 'MISSING_CANDIDATE_ID',
  FAILED_TO_FETCH_CANDIDATE = 'FAILED_TO_FETCH_CANDIDATE',
  INVALID_CANDIDATE = 'INVALID_CANDIDATE',
  INVALID_CANDIDATE_STATUS = 'INVALID_CANDIDATE_STATUS',
  INVALID_PAYMENT_OWNER = 'INVALID_PAYMENT_OWNER',
  CANDIDATE_FEES_ALREADY_PAID = 'CANDIDATE_FEES_ALREADY_PAID',
}

export function getErrorMessage(error: Errors): string {
  switch (error) {
    case Errors.INSUFFICIENT_PERMISSIONS:
      return 'You do not have sufficient permissions to perform this action.'
    case Errors.NOT_LOGGED_IN:
      return 'Please log in to continue using DTTD dashboard'
    case Errors.MISSING_CANDIDATE_ID:
      return 'Missing candidate ID in payment request'
    case Errors.FAILED_TO_FETCH_CANDIDATE:
      return 'Failed to load candidate information'
    case Errors.INVALID_CANDIDATE:
      return 'Invalid candidate'
    case Errors.INVALID_CANDIDATE_STATUS:
      return 'Candidate is not awaiting payment'
    case Errors.INVALID_PAYMENT_OWNER:
      return 'Invalid payment owner specified'
    case Errors.CANDIDATE_FEES_ALREADY_PAID:
      return 'Candidate fees already paid'
  }
}
