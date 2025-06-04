'use client'
import { ThemeProvider as MuiThemeProvider } from '@mui/material'
import { theme } from '@/lib/theme'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

type ThemeProviderProps = {
  children: React.ReactNode
}
const queryClient = new QueryClient()

export function ThemeProvider({ children }: ThemeProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MuiThemeProvider theme={theme}>
        <AppRouterCacheProvider>{children}</AppRouterCacheProvider>
      </MuiThemeProvider>
    </QueryClientProvider>
  )
}
