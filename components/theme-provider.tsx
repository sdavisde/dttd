'use client'
import { ThemeProvider as MuiThemeProvider } from '@mui/material'
import { theme } from '@/lib/theme'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'

type ThemeProviderProps = {
  children: React.ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <MuiThemeProvider theme={theme}>
      <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
    </MuiThemeProvider>
  )
}
