import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const typographyVariants = cva('', {
  variants: {
    variant: {
      h1: 'scroll-m-20 text-3xl font-bold tracking-tight lg:text-4xl',
      h2: 'scroll-m-20 border-b pb-2 text-2xl font-semibold tracking-tight first:mt-0',
      h3: 'scroll-m-20 text-xl font-semibold tracking-tight',
      h4: 'scroll-m-20 text-lg font-semibold tracking-tight',
      h5: 'scroll-m-20 text-base font-semibold tracking-tight',
      h6: 'scroll-m-20 text-sm font-semibold tracking-tight',
      p: 'leading-7 [&:not(:first-child)]:mt-2',
      blockquote: 'mt-6 border-l-2 pl-6 italic',
      code: 'relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold',
      lead: 'text-xl text-muted-foreground',
      large: 'text-lg font-semibold',
      small: 'text-sm font-medium leading-none',
      muted: 'text-sm text-muted-foreground',
      inline: 'text-base',
    },
    align: {
      left: 'text-left',
      center: 'text-center',
      right: 'text-right',
      justify: 'text-justify',
    },
    // weight: {
    //   normal: 'font-normal',
    //   medium: 'font-medium',
    //   semibold: 'font-semibold',
    //   bold: 'font-bold',
    //   extrabold: 'font-extrabold',
    // },
  },
  defaultVariants: {
    variant: 'p',
    align: 'left',
    // weight: 'normal',
  },
})

export interface TypographyProps extends React.HTMLAttributes<HTMLElement>, VariantProps<typeof typographyVariants> {
  as?: React.ElementType
  children: React.ReactNode
}

const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ className, variant, align, as, children, ...props }, ref) => {
    // Determine the default tag based on variant
    const getDefaultTag = (variant: string | null | undefined) => {
      switch (variant) {
        case 'h1':
          return 'h1'
        case 'h2':
          return 'h2'
        case 'h3':
          return 'h3'
        case 'h4':
          return 'h4'
        case 'h5':
          return 'h5'
        case 'h6':
          return 'h6'
        case 'blockquote':
          return 'blockquote'
        case 'code':
          return 'code'
        case 'lead':
        case 'large':
        case 'small':
        case 'muted':
        case 'inline':
        case 'p':
        default:
          return 'p'
      }
    }

    const Component = as || getDefaultTag(variant)

    return (
      <Component
        ref={ref}
        className={cn(typographyVariants({ variant, align, className }))}
        {...props}
      >
        {children}
      </Component>
    )
  }
)

Typography.displayName = 'Typography'

export { Typography, typographyVariants }
