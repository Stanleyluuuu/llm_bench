import React from 'react'
import { motion } from 'framer-motion'

interface LeaderboardModel {
  name: string
  score: number
  isBaseline?: boolean
}

interface ModelLeaderboardProps {
  models: LeaderboardModel[]
  selectedModelName?: string
  onModelSelect: (name: string) => void
}

export const ModelLeaderboard: React.FC<ModelLeaderboardProps> = ({
  models,
  selectedModelName,
  onModelSelect,
}) => {
  const sortedModels = [...models].sort((a, b) => b.score - a.score)
  const highestScore = sortedModels[0]?.score || 1

  return (
    <div className="space-y-2 bg-card p-5 rounded-md border border-border shadow-sm">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">模型對比排行榜</h3>
        <span className="text-[11px] text-muted-foreground/70">以最優表現排序</span>
      </div>

      {sortedModels.map((model, index) => {
        const isCurrentSelected = model.name === selectedModelName
        const relativePercentage = (model.score / highestScore) * 100

        return (
          <button
            key={model.name}
            type="button"
            onClick={() => onModelSelect(model.name)}
            aria-pressed={isCurrentSelected}
            className={`group w-full text-left p-2.5 rounded-md border transition-all duration-200 cursor-pointer flex items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 focus-visible:ring-offset-background
              ${isCurrentSelected
                ? 'bg-primary/10 border-primary/50 shadow-sm shadow-primary/5'
                : 'bg-transparent border-transparent hover:bg-secondary hover:border-border'
              }`}
          >
            <span className="text-[11px] font-mono text-muted-foreground/60 w-4 text-center shrink-0">
              {index + 1}
            </span>

            <div
              className={`w-0.5 h-6 rounded-full transition-all duration-300
                ${isCurrentSelected ? 'bg-primary scale-y-100' : 'bg-transparent scale-y-50 group-hover:bg-border'}`}
            />

            <div className="flex-grow min-w-0">
              <div className="flex justify-between items-center mb-1 gap-2">
                <span className="text-xs font-medium text-foreground truncate group-hover:text-primary transition-colors">
                  {model.name}
                  {model.isBaseline && (
                    <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-secondary text-muted-foreground border border-border">
                      baseline
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold font-mono text-foreground">
                  {(model.score * 100).toFixed(1)}%
                </span>
              </div>

              <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${relativePercentage}%` }}
                  transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: index * 0.1 }}
                  className={`h-full rounded-full
                    ${isCurrentSelected
                      ? 'bg-primary'
                      : 'bg-muted-foreground/40 group-hover:bg-muted-foreground/60'
                    }`}
                />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
