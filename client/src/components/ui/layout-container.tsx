import React from 'react'
import { cn } from '@/lib/utils'

interface LayoutContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  padded?: boolean
  bleed?: boolean
}

// Provides a consistent max-width frame using tokens
export const LayoutContainer: React.FC<LayoutContainerProps> = ({
  width = 'xl',
  padded = true,
  bleed = false,
  className,
  ...props
}) => {
  const widthMap = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full'
  }[width]
  return (
    <div className={cn('w-full mx-auto', widthMap, padded && 'px-6', bleed && 'px-0', className)} {...props} />
  )
}
