import React from 'react'
import { cn } from '@/lib/utils'

interface GlassPanelProps {
  children: React.ReactNode
  className?: string
}

export const GlassPanel: React.FC<GlassPanelProps> = ({ children, className }) => {
  return (
    <div
      className={cn(
        'rounded-md border border-white/10 bg-slate-900/60 backdrop-blur-md',
        className
      )}
    >
      {children}
    </div>
  )
}
