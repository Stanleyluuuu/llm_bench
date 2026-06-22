import { createPortal } from 'react-dom'
import { AlertTriangle } from 'lucide-react'

interface DeleteConfirmModalProps {
  onConfirm: () => void
  onCancel: () => void
  deleting?: boolean
  count?: number
}

export function DeleteConfirmModal({ onConfirm, onCancel, deleting = false, count = 1 }: DeleteConfirmModalProps) {
  const message = count === 1 ? '確定刪除此筆 run？' : `確定刪除這 ${count} 筆紀錄？`

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onCancel}
    >
      <div
        className="bg-card border border-border rounded-md p-6 w-72 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <AlertTriangle className="w-8 h-8 text-amber-500" aria-hidden="true" />
          <p className="text-sm font-medium text-foreground">
            {message}<br />
            <span className="text-muted-foreground font-normal">此操作無法還原。</span>
          </p>
        </div>
        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 py-2 rounded-md border border-border text-sm text-muted-foreground hover:bg-accent transition-colors disabled:opacity-50"
          >
            取消
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2 rounded-md bg-destructive text-destructive-foreground text-sm hover:bg-destructive/90 transition-colors disabled:opacity-50 font-medium"
          >
            {deleting ? '刪除中…' : '確認刪除'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
