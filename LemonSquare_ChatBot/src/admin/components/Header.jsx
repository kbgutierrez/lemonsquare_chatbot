import { Database } from 'lucide-react'

const Header = () => {
  return (
    <header className="flex items-center justify-between rounded-lg bg-slate-900 px-4 py-3 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-slate-800">
          <Database className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-base font-semibold">LemonSquare</h1>
          <p className="text-xs text-slate-400">Knowledge Management</p>
        </div>
      </div>
    </header>
  )
}

export default Header
