import type { ReactNode } from 'react'

interface LayoutProps {
  children: ReactNode
  headerRight?: ReactNode
}

export function Layout({ children, headerRight }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="w-full px-4 sm:px-6 pt-6 lg:pt-8">
        <div className="max-w-[1100px] mx-auto">
        <header className="mb-5 animate-fade-in" role="banner">
          <div className="bg-card border border-border rounded-md p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2.5 mb-0.5">
                <span className="text-xl" aria-hidden="true">⚡</span>
                <h1 className="text-xl font-bold text-foreground truncate">
                  AI 模型評測平台
                </h1>
              </div>
              <p className="text-xs text-muted-foreground">選擇模型與測試專案，一鍵比較 LLM / VLM 效能</p>
            </div>
            {headerRight && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {headerRight}
              </div>
            )}
          </div>
        </header>
        <main id="main-content" className="space-y-4 pb-28">{children}</main>
        </div>
      </div>
    </div>
  )
}
