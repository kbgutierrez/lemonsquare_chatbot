import { Trash2 } from 'lucide-react'

const FileTable = ({ files }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-b border-slate-200 bg-slate-50">
          <tr>
            <th className="px-3 py-2 text-left font-medium text-slate-700">File name</th>
            <th className="px-3 py-2 text-left font-medium text-slate-700">Type</th>
            <th className="px-3 py-2 text-left font-medium text-slate-700">Status</th>
            <th className="px-3 py-2 text-center font-medium text-slate-700">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {files.map((file) => (
            <tr key={file.id} className="hover:bg-slate-50">
              <td className="px-3 py-2 text-slate-900">{file.name}</td>
              <td className="px-3 py-2 text-slate-600">{file.type}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                  file.status === 'Ready' ? 'bg-green-100 text-green-800' :
                  file.status === 'Processing' ? 'bg-amber-100 text-amber-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {file.status}
                </span>
              </td>
              <td className="px-3 py-2 text-center">
                <button className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-600 hover:bg-slate-200 transition">
                  <Trash2 className="h-3 w-3" />
                  Delete
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
