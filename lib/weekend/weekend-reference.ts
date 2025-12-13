/**
 * Used to help stringify a reference to a weekend to store in the DB
 */
export class WeekendReference {
  community: string
  weekend_number: number

  constructor(community: string, weekend_number: number) {
    this.community = community
    this.weekend_number = weekend_number
  }

  static fromString(weekendReferenceString: string): WeekendReference {
    const [community, weekendNumber] = weekendReferenceString.split('-')
    return new WeekendReference(community, parseInt(weekendNumber))
  }

  toString(): string {
    return `${this.community}-${this.weekend_number}`
  }
}
