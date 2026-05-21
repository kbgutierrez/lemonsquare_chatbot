import { useState } from "react"
import { Save, LoaderCircle, RotateCcw, AlertTriangle } from "lucide-react"
import { useAuth } from "../../shared/hooks/useAuth.js"

const SettingsSection = () => {
  const { adminUser } = useAuth()
  const [confirmDialog, setConfirmDialog] = useState(false)

  return (
    <div className="section-padding max-w-4xl mx-auto space-y-6">
      <div className="card-surface section-padding space-y-6">
        <div>
          <span className="text-label">General</span>
          <h2 className="text-xl font-bold text-white">Application Settings</h2>
        </div>
        <div className="rounded-xl border border-[#2a3a33] bg-[#18211f] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-white">Logged in as</p>
              <p className="text-xs text-[#74877f]">{adminUser?.name || "Administrator"}</p>
            </div>
            <button onClick={() => { localStorage.removeItem("admin_auth"); localStorage.removeItem("admin_user"); window.location.reload() }}
              className="btn-danger">
              Sign Out
            </button>
          </div>
        </div>
      </div>

      <div className="card-surface section-padding space-y-6">
        <div>
          <span className="text-label">Danger Zone</span>
          <h2 className="text-xl font-bold text-red-400">Data Management</h2>
        </div>
        <p className="text-sm text-[#74877f]">These actions are irreversible. Use with caution.</p>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => setConfirmDialog(true)} className="btn-danger">
            <AlertTriangle className="h-4 w-4" /> Clear All Data
          </button>
        </div>
      </div>

      {/* Confirm Dialog */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => setConfirmDialog(false)}>
          <div className="relative w-full max-w-md overflow-hidden rounded-3xl border border-[#2a3a33] bg-[#111917] p-6 shadow-[0_20px_80px_rgba(0,0,0,0.45)]" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col items-center text-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-red-500/20 bg-red-500/10">
                <AlertTriangle className="h-8 w-8 text-red-400" />
              </div>
              <h2 className="text-xl font-bold text-white">Clear All Data?</h2>
              <p className="text-sm text-[#9cb0a8]">This will delete all documents, tickets, chat sessions, and manual entries. This action cannot be undone.</p>
              <div className="flex w-full gap-3">
                <button onClick={() => setConfirmDialog(false)} className="btn-secondary flex-1">Cancel</button>
                <button onClick={() => { setConfirmDialog(false); alert("Clear all data is not yet implemented.") }} className="btn-danger flex-1">
                  Confirm Clear
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SettingsSection
