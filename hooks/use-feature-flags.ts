type FeatureFlags = 'candidate-filters'

export function useFeatureFlags() {
  const isEnabled = (flag: FeatureFlags): boolean => {
    // Map friendly names to actual environment variables
    const flags: Record<FeatureFlags, string | undefined> = {
      'candidate-filters': process.env.NEXT_PUBLIC_ENABLE_CANDIDATE_FILTERS,
    }

    const value = flags[flag]
    return value === 'true'
  }

  return { isEnabled }
}
