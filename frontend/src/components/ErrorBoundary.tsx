import { Component, type ReactNode } from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface Props {
  children: ReactNode
  fallbackMessage?: string
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-4 p-8 bg-card border border-border rounded-md text-center"
        >
          <div className="p-3 rounded-full bg-destructive/10">
            <AlertTriangle className="w-6 h-6 text-destructive" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold text-foreground">
              {this.props.fallbackMessage ?? '頁面發生錯誤'}
            </h3>
            <p className="text-xs text-muted-foreground max-w-xs">
              {this.state.error?.message ?? '未知錯誤'}
            </p>
          </div>
          <button
            type="button"
            onClick={this.handleReset}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-secondary border border-border rounded-md hover:bg-accent transition-colors text-foreground"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            重試
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
