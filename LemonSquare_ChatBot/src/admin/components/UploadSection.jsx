import { Upload, CheckCircle } from 'lucide-react'
import FileTable from './FileTable.jsx'
import { mockFiles } from '../data/mockFiles.js'

const UploadSection = () => {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-900">Upload Knowledge Base Files</h3>
        <p className="text-xs text-slate-600">Drag or click to upload documents (PDF, TXT, DOCX, XLSX, CSV)</p>
      </div>

      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-6 w-6 text-slate-400" />
          <p className="text-sm font-medium text-slate-700">Drop files here</p>
          <p className="text-xs text-slate-500">or click to select</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 p-3">
        <CheckCircle className="mt-0.5 h-4 w-4 text-green-600" />
        <div className="flex-1">
          <p className="text-xs font-medium text-green-900">Upload complete</p>
          <p className="text-xs text-green-700">Your files have been added to the knowledge base</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h4 className="text-sm font-semibold text-slate-900">Files ({mockFiles.length})</h4>
        </div>
        <div className="overflow-x-auto">
          <FileTable files={mockFiles} />
        </div>
      </div>
    </div>
  )
}

export default UploadSection
