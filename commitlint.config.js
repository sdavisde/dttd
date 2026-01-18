const config = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Enforce conventional commit types
    'type-enum': [
      2,
      'always',
      [
        'feat', // New feature (triggers MINOR release)
        'fix', // Bug fix (triggers PATCH release)
        'docs', // Documentation only
        'style', // Code style (formatting, semicolons, etc.)
        'refactor', // Code refactoring (no feature/fix)
        'perf', // Performance improvement
        'test', // Adding or updating tests
        'build', // Build system or dependencies
        'ci', // CI configuration
        'chore', // Maintenance tasks
        'revert', // Reverting commits
      ],
    ],
    // Require lowercase type
    'type-case': [2, 'always', 'lower-case'],
    // Require non-empty type
    'type-empty': [2, 'never'],
    // Require non-empty subject
    'subject-empty': [2, 'never'],
    // No period at end of subject
    'subject-full-stop': [2, 'never', '.'],
    // Max header length
    'header-max-length': [2, 'always', 100],
  },
}

export default config
