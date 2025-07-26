export enum Errors {
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  NOT_LOGGED_IN = 'NOT_LOGGED_IN',
}

export function getErrorMessage(error: Errors): string {
  switch (error) {
    case Errors.INSUFFICIENT_PERMISSIONS:
      return 'You do not have sufficient permissions to perform this action.'
    case Errors.NOT_LOGGED_IN:
      return 'Please log in to continue using DTTD dashboard'
  }
}
