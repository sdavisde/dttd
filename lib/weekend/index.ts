export const genderMatchesWeekend = (gender: string | null, weekendType: string | null) => {
  if (!gender || !weekendType) return false
  return (gender === 'male' && weekendType === 'MENS') || (gender === 'female' && weekendType === 'WOMENS')
}
