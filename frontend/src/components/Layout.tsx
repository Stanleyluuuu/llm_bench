import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  headerRight?: ReactNode
}

export function Layout({ children, headerRight }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-10 xl:px-14 2xl:px-20 3xl:px-28 pt-6 lg:pt-8">
        <header className="mb-6 lg:mb-8 animate-fade-in" role="banner">
          <div className="bg-card border border-border rounded-md p-4 sm:p-5 lg:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-primary text-xl" aria-hidden="true">⚡</span>
                <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold text-foreground truncate">
                  AI 模型評測平台
                </h1>
              </div>
              <p className="text-sm text-muted-foreground">選擇模型與測試專案，一鍵比較效能表現</p>
            </div>
            {headerRight && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerRight}
              </div>
            )}
          </div>
        </header>
        <main id="main-content" className="space-y-5 lg:space-y-6 pb-28">{children}</main>
      </div>
    </div>
  )
}
