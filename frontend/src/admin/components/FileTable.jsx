/**
 * FileTable Component
 * Displays files in a responsive table format
 * Features modern purple theme with hover effects and status badges
 */

import { Trash2 } from 'lucide-react'

const FileTable = ({ files }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-purple-200 bg-purple-50">
          <tr>
            <th className="px-6 py-3 text-left font-semibold text-purple-900 uppercase tracking-wider text-xs">File name</th>
            <th className="px-6 py-3 text-left font-semibold text-purple-900 uppercase tracking-wider text-xs">Type</th>
            <th className="px-6 py-3 text-left font-semibold text-purple-900 uppercase tracking-wider text-xs">Status</th>
            <th className="px-6 py-3 text-center font-semibold text-purple-900 uppercase tracking-wider text-xs">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-purple-100">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-purple-50 transition-colors duration-200">
              <td className="px-6 py-4 text-purple-900 font-medium">{file.name}</td>
              <td className="px-6 py-4 text-purple-700">{file.type}</td>
              <td className="px-6 py-4">
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  file.status === 'Ready' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : file.status === 'Processing' 
                    ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                }`}>
                  {file.status}
                </span>
              </td>
              <td className="px-6 py-4 text-center">
                <button className="inline-flex items-center gap-2 rounded-lg bg-red-50 px-3 py-1.5 text-sm text-red-600 hover:bg-red-100 transition-all duration-200 border border-red-200 font-medium hover:shadow-md">
                  <Trash2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Delete</span>
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default FileTable
